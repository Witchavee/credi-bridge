const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

// --- OCR Credentials ---
const PROJECT_ID = 'd457f36b291e482a95b25423703d7733';
const AK = 'HPUABKV3AJDEB2WM5QXU';
const SK = 'kenNkrtKtbmMVSi04KurC0DxOk7rEJnPF66mtFYl';

// --- OCR Signing Functions ---
function hmacSha256(key, msg, encoding) {
  return crypto.createHmac('sha256', key).update(msg).digest(encoding);
}
function sha256(msg, encoding) {
  return crypto.createHash('sha256').update(msg).digest(encoding);
}
function getCanonicalRequest(method, uri, queryString, headers, signedHeaders, payloadHash) {
  return [
    method,
    uri,
    queryString,
    Object.keys(headers)
      .sort()
      .map((k) => `${k.toLowerCase()}:${headers[k].trim()}`)
      .join('\n') + '\n',
    signedHeaders,
    payloadHash
  ].join('\n');
}
function getStringToSign(time, credentialScope, canonicalRequest) {
  return ['SDK-HMAC-SHA256', time, credentialScope, sha256(canonicalRequest, 'hex')].join('\n');
}
function getCredentialScope(date, region, service) {
  return [date, region, service, 'sdk_request'].join('/');
}
function signRequest({ method, uri, queryString = '', headers, body = '', region = 'ap-southeast-2', service = 'ocr' }) {
  const time = headers['x-sdk-date'];
  const date = time.slice(0, 8);
  const payloadHash = sha256(body, 'hex');
  const signedHeaders = Object.keys(headers)
      .map(k => k.toLowerCase())
      .sort()
      .join(';');
  const canonicalRequest = getCanonicalRequest(method, uri, queryString, headers, signedHeaders, payloadHash);
  const credentialScope = getCredentialScope(date, region, service);
  const stringToSign = getStringToSign(time, credentialScope, canonicalRequest);
  const kDate = hmacSha256(`SDK${SK}`, date);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'sdk_request');
  const signature = hmacSha256(kSigning, stringToSign, 'hex');
  return `SDK-HMAC-SHA256 Credential=${AK}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}
async function callOcrApi(imageBase64) {
  const method = 'POST';
  const host = 'ocr.ap-southeast-2.myhuaweicloud.com';
  const uri = `/v2/${PROJECT_ID}/ocr/general-text`;
  const url = `https://${host}${uri}`;
  const time = moment.utc().format('YYYYMMDDTHHmmss') + 'Z';
  const body = JSON.stringify({ image: imageBase64 });
  const headers = {
    'content-type': 'application/json',
    host: host,
    'x-sdk-date': time,
    'Enterprise-Project-Id': PROJECT_ID
  };
  const authorization = signRequest({ method, uri, headers, body });
  headers.Authorization = authorization;
  // debug
  console.log('Full OCR endpoint:', url);
  try {
    const response = await axios.post(url, body, { headers });
    return response.data;
  } catch (error) {
    console.error('OCR API Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// --- Express & Multer Setup ---
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/api/analyze-image', upload.single('imageFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'ไม่พบไฟล์ภาพ' });
    }
    const imageBase64 = req.file.buffer.toString('base64');
    const ocrResult = await callOcrApi(imageBase64);
    res.json({
      message: 'วิเคราะห์เรียบร้อย',
      ocrData: ocrResult.result
    });
  } catch (error) {
    res.status(500).json({
      message: 'มีข้อผิดพลาดขณะวิเคราะห์ภาพ',
      error: error.message
    });
  }
});

// ให้ Node.js รับ request จากภายนอก (nginx) ได้
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
