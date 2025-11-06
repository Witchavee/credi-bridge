// 1. นำเข้าเครื่องปรุง (Express และ "กุญแจ" MySQL)
const express = require('express');
const mysql = require('mysql2/promise'); // <-- (1. อัปเกรดเป็น 'mysql2/promise' (ง่ายกว่า))
const app = express();
const port = 3000;

// 2. "ตัวแปลภาษา" (Middleware)
app.use(express.json());

// -----------------------------------------------------------------
// ‼️ "การบ้าน" (Homework) - เอา "กุญแจ" และ "ที่อยู่" มาใส่ตรงนี้
// -----------------------------------------------------------------
const dbConfig = {
  host: '5ae7a0868ac347ac8e72eec6199171c1in01.internal.ap-southeast-2.mysql.rds.myhuaweicloud.com', // <-- (ใส่ "ชื่อยาวๆ" ที่คุณ "คัดลอก" (Copied) มา)
  user: 'root', // (นี่คือ "แอดมิน" (Admin) ของ DB เสมอ)
  password: 'Credi_', // <-- (‼️ ใส่ "รหัสผ่าน DB" ‼️ ที่คุณ "จด" (Noted) ไว้ตอน "สร้าง" (Create) RDS)
  database: 'credi_bridge_db' // (เราจะ "สร้าง" (Create) "แฟ้ม" (Database) นี้ใน "ขั้นตอนที่ 3.B")
};
// -----------------------------------------------------------------


// 3. "สูตรอาหาร" (เส้นทาง)
app.get('/', (req, res) => {
  res.send('Credi-Bridge API is LIVE! (v4 - DB Connected!)');
});

// 4. (UPGRADED!) "เส้นทางใหม่" (New Endpoint) - "ทดสอบการเชื่อมต่อ" (Test DB Connection)
//    เราจะ "สร้าง" (Create) ประตู "ใหม่" (New) นี้... เพื่อ "ทดสอบ" (Test) ว่าเรา "คุย" (Talk) กับ DB ได้จริงไหม
app.get('/api/test-db', async (req, res) => {
  let connection;
  try {
    // 5. "ลอง" (Try) "เชื่อมต่อ" (Connect)
    connection = await mysql.createConnection(dbConfig);

    // 6. "ลอง" (Try) "สร้าง" (Create) "แฟ้ม" (Database) (ถ้ามันยังไม่มี)
    await connection.query(`CREATE DATABASE IF NOT EXISTS credi_bridge_db;`);

    // 7. "เลือก" (Select) "แฟ้ม" (Database) ที่จะใช้
    await connection.query(`USE credi_bridge_db;`);

    // 8. "ลอง" (Try) "สร้าง" (Create) "โต๊ะ" (Table) (ถ้ามันยังไม่มี)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        score_value INT,
        grade VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. "ลอง" (Try) "ใส่" (Insert) "ข้อมูลจำลอง" (Mock Data) ลงไป
    await connection.query(
      'INSERT INTO scores (score_value, grade) VALUES (?, ?)', 
      [780, 'B+'] // (นี่คือ "คะแนนจำลอง" (Mock Score) ของเรา)
    );

    // 10. "ส่งคำตอบ" กลับไป
    res.json({
        message: 'SUCCESS! "เชื่อมต่อ" (Connected), "สร้าง" (Created) DB, "สร้าง" (Created) Table, และ "ใส่" (Inserted) ข้อมูล... "สำเร็จ" (Complete) 100%!'
    });

  } catch (error) {
    // 11. "จัดการ" (Handle) กรณี "พัง" (Error)
    console.error('Database Connection Error:', error.message);
    res.status(500).json({
        message: 'Error: ไม่สามารถ "เชื่อมต่อ" (Connect) หรือ "เขียน" (Write) ฐานข้อมูล (DB) ได้',
        error: error.message
    });
  } finally {
    // 12. "ปิด" (Close) การเชื่อมต่อ "เสมอ" (Always)
    if (connection) await connection.end();
  }
});

// 13. "เปิดร้าน" (เริ่มรันเซิร์ฟเวอร์)
app.listen(port, () => {
  console.log(`Credi-Bridge app listening on http://localhost:${port}`);
});