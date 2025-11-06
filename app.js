// 1. นำเข้าเครื่องปรุง (Express, MySQL, และ "Path" (ใหม่!))
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path'); // <-- (1. "ของใหม่!" (New!) นี่คือเครื่องมือสำหรับ "หา" (find) ไฟล์ .html ครับ)
const app = express();
const port = 3000;

// 2. "ตัวแปลภาษา" (Middleware)
app.use(express.json());
// (NEW!) "เสิร์ฟ" (Serve) "ไฟล์" (Files) ทั้งหมด "ใน" (in) "โฟลเดอร์ 'public'" (the 'public' folder)
app.use(express.static(path.join(__dirname, 'public')));

// -----------------------------------------------------------------
// ‼️ "การบ้าน" (Homework) - (ส่วนนี้ "ถูกต้อง" 100% แล้วครับ! "ห้าม" (DO NOT) แก้ไข!)
// -----------------------------------------------------------------
const dbConfig = {
  host: '5ae7a0868ac347ac8e72eec6199171c1in01.internal.ap-southeast-2.mysql.rds.myhuaweicloud.com', // (นี่คือ "ที่อยู่" (Host) "ยาวๆ" ของคุณ)
  user: 'root', 
  password: 'Credi_bridge_db', // (นี่คือ "รหัสผ่าน DB" (DB Pass) "ใหม่" (New) ของคุณ)
  // (เรา "ลบ" (Remove) 'database: ...' ออกจาก "Config หลัก" (Main Config) นี้)
};
const DATABASE_NAME = 'credi_bridge_db'; // (เรา "ย้าย" (Move) "ชื่อ" (Name) DB มาไว้ "ตัวแปร" (Variable) นี้แทน)
// -----------------------------------------------------------------


// 3. (UPGRADED!) "สูตรอาหาร" (เส้นทาง) - (หน้าแรก)
app.get('/', (req, res) => {
  // "แทนที่" (Instead of) res.send('Hello')...
  // ..."ให้" (Serve) "ส่ง" (send) "ไฟล์" (file) ที่ชื่อ "index.html"
  // (ที่ "ซ่อน" (hidden) อยู่ใน "โฟลเดอร์ 'public'" (public folder) ... ที่เรา "กำลังจะ" (about to) สร้างครับ)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. (UPGRADED!) "เส้นทางสำหรับสมองจำลอง" (Mock Brain API Endpoint)
app.post('/api/calculate-score', async (req, res) => {
  let connection;
  try {
    // 5. "รับข้อมูล" (Get Data)
    //    (ครั้งนี้... เรา "รับ" (Receive) "ข้อความรีวิว" (reviewText) "จริงๆ" (real) จาก "Frontend" (หน้าเว็บ) ครับ!)
    const { reviewText } = req.body; // (เรา "ดึง" (Destructure) "reviewText" ออกมาจาก JSON body)

    if (!reviewText) {
      return res.status(400).json({ message: 'Error: "reviewText" is missing.' });
    }

    // 6. "ฟังก์ชันสมองจำลอง" (Mock AI Function)
    //    (นี่คือ "AI จำลอง" (Mock AI) ของเรา... เรา "แกล้งทำ" (Pretend) เป็น Pangu ครับ!)
    let mockGrade = 'Positive';
    let mockScore = 800; // (คะแนนเริ่มต้น)

    if (reviewText.includes('แย่') || reviewText.includes('ห่วย') || reviewText.includes('ช้า')) {
        mockGrade = 'Negative';
        mockScore = 200;
    } else if (reviewText.includes('แต่')) {
        mockGrade = 'Neutral';
        mockScore = 500;
    }

    // 7. (NEW!) "เชื่อมต่อ" (Connect) "ฐานข้อมูลจริง" (Real Database)
    //    (เราจะ "บันทึก" (Save) "ผลลัพธ์จำลอง" (Mock Result) นี้... ลงใน "DB จริง" (Real DB) ของเราครับ!)
    console.log('Connecting to DB to save mock score...');
    connection = await mysql.createConnection({
        ...dbConfig, // (ใช้ Config หลัก)
        database: DATABASE_NAME // (และ "เลือก" (Select) "แฟ้ม" (DB) ของเรา)
    });

    // 8. "บันทึก" (Save) "คะแนน" (Score) ลงใน "โต๊ะ" (Table) `scores`
    await connection.query(
      'INSERT INTO scores (score_value, grade) VALUES (?, ?)', 
      [mockScore, mockGrade]
    );
    console.log('Mock score saved to DB!');

    // 9. "ส่งคำตอบ" กลับไป
    res.json({
        message: 'คำนวณคะแนน (จาก "สมองจำลอง") สำเร็จ!',
        score: mockScore,
        grade: mockGrade,
        analyzedText: reviewText
    });

  } catch (error) {
    // 10. "จัดการ" (Handle) กรณี "พัง" (Error)
    console.error('API Error:', error.message);
    res.status(500).json({
        message: 'Error: API /api/calculate-score พัง',
        error: error.message
    });
  } finally {
    // 11. "ปิด" (Close) การเชื่อมต่อ "เสมอ" (Always)
    if (connection) await connection.end();
  }
});

// 12. "เปิดร้าน" (เริ่มรันเซิร์ฟเวอร์)
app.listen(port, () => {
  console.log(`Credi-Bridge app listening on http://localhost:${port}`);
});