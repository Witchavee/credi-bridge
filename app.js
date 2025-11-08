const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment-timezone');

const PROJECT_ID = 'd457f36b291e482a95b25423703d7733';
const AK = 'HPUABKV3AJDEB2WM5QXU';
const SK = 'kenNkrtKtbmMVSi04KurC0DxOk7rEJnPF66mtFYl';

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

  // 1. Calculate payload hash
  const payloadHash = sha256(body, 'hex');

  // 2. Signed headers list
  const signedHeaders = Object.keys(headers)
    .map(k => k.toLowerCase())
    .sort()
    .join(';');

  // 3. Canonical request
  const canonicalRequest = getCanonicalRequest(method, uri, queryString, headers, signedHeaders, payloadHash);

  // 4. Credential scope
  const credentialScope = getCredentialScope(date, region, service);

  // 5. String to sign
  const stringToSign = getStringToSign(time, credentialScope, canonicalRequest);

  // 6. Calculate signing key
  const kDate = hmacSha256(`SDK${SK}`, date);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  const kSigning = hmacSha256(kService, 'sdk_request');

  // 7. Calculate signature
  const signature = hmacSha256(kSigning, stringToSign, 'hex');

  // 8. Authorization header
  const authorization = `SDK-HMAC-SHA256 Credential=${AK}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return authorization;
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
    'x-sdk-date': time
  };

  // Sign the request
  const authorization = signRequest({ method, uri, headers, body });

  // Add Authorization header
  headers.Authorization = authorization;

  try {
    const response = await axios.post(url, body, { headers });

    console.log('OCR API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API call failed:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// Example usage:
// const fs = require('fs');
// const imageBuffer = fs.readFileSync('path_to_image.jpg');
// const imageBase64 = imageBuffer.toString('base64');
// callOcrApi(imageBase64);

