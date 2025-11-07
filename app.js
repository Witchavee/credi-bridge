// 1. นำเข้าเครื่องปรุง (Express, MySQL, Path, และ "ของใหม่" (NEW!): Axios, Multer)
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const axios = require('axios'); // (NEW! "โทรศัพท์" (Phone) "ของเรา" (Our))
const multer = require('multer'); // (เครื่องมือ "รับไฟล์" (File Upload))

const app = express();
const port = 3000;

// 2. "ตั้งค่า" (Setup) "ที่เก็บไฟล์" (File Storage)
const upload = multer({ storage: multer.memoryStorage() });

// 3. "ตัวแปลภาษา" (Middleware)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------------------
// ‼️ "การบ้าน" (Homework) - "กุญแจ 'ฐานข้อมูล' (DB)" (DB Keys)
// -----------------------------------------------------------------
const dbConfig = {
  // (ใส่ "ชื่อยาวๆ" (Private Domain Name) ที่คุณ "คัดลอก" (Copied) มาจากหน้า RDS Details)
  host: '5ae7a0868ac347ac8e72eec6199171c1in01.internal.ap-southeast-2.mysql.rds.myhuaweicloud.com', 

  // (นี่คือ "แอดมิน" (Admin) ของ DB เสมอ)
  user: 'root', 

  // (‼️ ใส่ "รหัสผ่าน 3" (Password 3) (DB Pass) ‼️ ที่คุณ "จด" (Noted) ไว้ตอน "สร้าง" (Create) RDS)
  password: 'Credi_bridge_db', 
};
const DATABASE_NAME = 'credi_bridge_db';
// -----------------------------------------------------------------

// -----------------------------------------------------------------
// ‼️ "การบ้าน" (Homework) - "กุญแจ AI (OCR) 'ชุดใหม่'" (NEW AI (OCR) Keys)
// -----------------------------------------------------------------
const IAM_ENDPOINT = 'https://iam.ap-southeast-2.myhuaweicloud.com/v3/auth/tokens'; [cite_start]// ("ที่อยู่" (Endpoint) "ขอ Token" (Request Token) "ใน 'AP-Bangkok'" (in 'AP-Bangkok') [cite: 414])
const OCR_ENDPOINT = 'https://ocr.ap-southeast-2.myhuaweicloud.com/v2'; [cite_start]// ("ที่อยู่" (Endpoint) "OCR 'AP-Bangkok'" [cite: 346, 74])

// (ใส่ "Project ID" "AP-Bangkok" (จาก))
const OCR_PROJECT_ID = 'd457f36b291e482a95b25423703d7733'; 

// (ใส่ "ชื่อ" (Name) "บัญชี" (Account) "หลัก" (Main) "ของคุณ" (your) (จาก))
const HUAWEI_ACCOUNT_NAME = 'hid_ig0eor204azdqfu'; [cite_start]// (นี่คือ "domainname" [cite: 428])

// (ใส่ "ชื่อ" (Name) "ผู้ใช้" (User) "ที่คุณ 'ล็อคอิน'" (Login) "เว็บ" (Console) "ด้วย" (with) (จาก))
const HUAWEI_IAM_USERNAME = 'hid_ig0eor204azdqfu'; [cite_start]// (นี่คือ "username" [cite: 425])

// (ใส่ "รหัสผ่าน" (Password) "ที่คุณ 'ล็อคอิน'" (Login) "เว็บ" (Console) "ด้วย" (with) (‼️ "รหัสผ่าน 1" ‼️))
const HUAWEI_IAM_PASSWORD = 'Prim2547_'; [cite_start]// (นี่คือ "password" [cite: 426])
// -----------------------------------------------------------------

// 4. (NEW v11!) "ฟังก์ชัน" (Function) "ขอ 'โทเค็น'" (Request 'Token')
async function getHuaweiToken() {
    console.log('Attempting to get Huawei IAM Token...');

    const tokenRequestBody = {
        "auth": {
            "identity": {
                "methods": ["password"],
                "password": {
                    "user": {
                        "name": HUAWEI_IAM_USERNAME,
                        "password": HUAWEI_IAM_PASSWORD,
                        "domain": {
                            "name": HUAWEI_ACCOUNT_NAME
                        }
                    }
                }
            },
            "scope": {
                "project": {
                    "id": OCR_PROJECT_ID 
                }
            }
        }
    };

    try {
        const response = await axios.post(IAM_ENDPOINT, tokenRequestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        // "ดึง" (Extract) "โทเค็น" (Token) "จาก 'Header'" (from the 'Header') "ของ 'คำตอบ'" (of the 'Response')
        const token = response.headers['x-subject-token']; 
        console.log('Successfully got IAM Token!');
        return token;

    } catch (error) {
        console.error('IAM Token Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get IAM Token');
    }
}


// 5. "สูตรอาหาร" (เส้นทาง) - (หน้าแรก)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 6. (UPGRADED v11!) "เส้นทางสำหรับสมอง AI (OCR) จริง" (Real AI (OCR) Brain)
app.post('/api/analyze-image', upload.single('imageFile'), async (req, res) => {

  console.log('ได้รับคำสั่ง /api/analyze-image!');

  if (!req.file) {
    return res.status(400).json({ message: 'Error: "imageFile" (ไฟล์รูปภาพ) is missing.' });
  }

  let token;
  try {
    // 7. (NEW!) "ขอ" (Request) "โทเค็น" (Token) "ชั่วคราว" (Temporary) "ก่อน" (First)
    token = await getHuaweiToken();

    // 8. "แปลง" (Convert) "ไฟล์" (File) "ที่อัปโหลด" (Uploaded) ... ให้เป็น "Base64" (Base64)
    const imageBase64 = req.file.buffer.toString('base64');

    // 9. "สร้าง" (Build) "คำสั่ง" (Request) "ยิง" (Call) "AI (OCR)" (AI (OCR))
    const ocrRequestBody = {
        image: imageBase64
    };

    // "สร้าง" (Build) "ที่อยู่" (URL) "เต็มๆ" (Full) (รวม "Project ID" (Project ID))
    [cite_start]// (เรา "ใช้" (Use) "บริการ" (Service) 'general-text' (ข้อความทั่วไป) [cite: 2415, 2488])
    const fullOcrEndpoint = `${OCR_ENDPOINT}/v2/${OCR_PROJECT_ID}/ocr/general-text`;

    // 10. "ยิง" (Call) "AI (OCR)" (AI (OCR)) (ด้วย "Token" (Token) "ที่เพิ่งได้มา" (we just got))
    console.log('Connecting to Huawei OCR AI with Token...');
    const ocrResult = await axios.post(fullOcrEndpoint, ocrRequestBody, {
        headers: {
            'Content-Type': 'application/json',
            [cite_start]'X-Auth-Token': token // (‼️ "ใส่" (Put) "โทเค็น" (Token) "ของเรา" (Our) "ที่นี่" (Here) ‼️ [cite: 377, 380])
        }
    });
    console.log('OCR AI analysis complete!');

    // 11. "ส่งคำตอบ" (Response) กลับไป
    res.json({
        message: 'วิเคราะห์ "ภาพ" (Image) (จาก "สมอง AI (OCR) จริง" v11 - Token Auth) สำเร็จ!',
        ocrData: ocrResult.data.result // (ส่ง "ผลลัพธ์" (Result) "จริงๆ" (Real) "กลับไป" (Back) "ให้ 'หน้าเว็บ'" (to the Frontend))
    });

  } catch (error) {
    // 12. "จัดการ" (Handle) กรณี "พัง" (Error)
    console.error('OCR AI Error (v11):', error.message);
    res.status(500).json({
        message: 'Error: API /api/analyze-image (v11) พัง',
        error: error.message
    });
  }
});

// 13. "เปิดร้าน" (เริ่มรันเซิร์ฟเวอร์)
app.listen(port, () => {
  console.log(`Credi-Bridge app listening on http://localhost:${port}`);
});