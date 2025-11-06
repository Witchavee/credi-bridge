// 1. นำเข้าเครื่องปรุง (Express และ "กุญแจ" MySQL)
const express = require('express');
const mysql = require('mysql2/promise'); // (ถูกต้อง 100%)
const app = express();
const port = 3000;

// 2. "ตัวแปลภาษา" (Middleware)
app.use(express.json());

// -----------------------------------------------------------------
// ‼️ "การบ้าน" (Homework) - (ส่วนนี้ "ถูกต้อง" 100% แล้วครับ! "ห้าม" (DO NOT) แก้ไข!)
// -----------------------------------------------------------------
const dbConfig = {
  host: '5ae7a868ac347ac8e72eec6199171c1in01.internal.ap-southeast-2.mysql.rds.myhuaweicloud.com', // (นี่คือ "ที่อยู่" (Host) "ยาวๆ" ของคุณ)
  user: 'root', 
  password: 'Credi_bridge_db', // (นี่คือ "รหัสผ่าน DB" (DB Pass) "ใหม่" (New) ของคุณ)
  // (เรา "ลบ" (Remove) 'database: ...' ออกจาก "Config หลัก" (Main Config) นี้)
};
const DATABASE_NAME = 'credi_bridge_db'; // (เรา "ย้าย" (Move) "ชื่อ" (Name) DB มาไว้ "ตัวแปร" (Variable) นี้แทน)
// -----------------------------------------------------------------


// 3. "สูตรอาหาร" (เส้นทาง)
app.get('/', (req, res) => {
  res.send('Credi-Bridge API is LIVE! (v5 - DB Logic Fixed!)');
});

// 4. (UPGRADED!) "เส้นทางใหม่" (New Endpoint) - "ทดสอบการเชื่อมต่อ" (v5)
app.get('/api/test-db', async (req, res) => {
  let connection;
  try {
    // 5. (NEW!) "เชื่อมต่อ" (Connect) "ครั้งที่ 1" (First time) - "โดยไม่ระบุ" (without) "database"
    //    เราจะเชื่อมต่อ "เข้า" (to) "เซิร์ฟเวอร์" (server) ... "ไม่" (not) "ฐานข้อมูล" (database)
    console.log('Attempting to connect to the "server" (root)...');
    connection = await mysql.createConnection(dbConfig); // (ใช้ "Config หลัก" (Main config) ที่ "ไม่มี" (no) 'database:')
    console.log('Server connection successful!');

    // 6. (NEW!) "สั่ง" (Command) "สร้าง" (Create) "แฟ้ม" (Database)
    //    (IF NOT EXISTS = "ถ้ายังไม่มี ก็ให้สร้าง" ... ซึ่ง "ปลอดภัย" (safe) ครับ)
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE_NAME}\`;`);
    console.log(`Database '${DATABASE_NAME}' is ready.`);

    // 7. (NEW!) "สั่ง" (Command) "เลือกใช้" (Select) "แฟ้ม" (Database) นั้น
    await connection.query(`USE \`${DATABASE_NAME}\`;`);
    console.log(`Switched to ${DATABASE_NAME}`);

    // 8. (Same as before) "ลอง" (Try) "สร้าง" (Create) "โต๊ะ" (Table) (ถ้ามันยังไม่มี)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        score_value INT,
        grade VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "scores" is ready.');

    // 9. (Same as before) "ลอง" (Try) "ใส่" (Insert) "ข้อมูลจำลอง" (Mock Data) ลงไป
    await connection.query(
      'INSERT INTO scores (score_value, grade) VALUES (?, ?)', 
      [780, 'B+'] // (นี่คือ "คะแนนจำลอง" (Mock Score) ของเรา)
    );
    console.log('Mock data inserted.');

    // 10. (Same as before) "ส่งคำตอบ" กลับไป
    res.json({
        message: 'SUCCESS! (v5) "เชื่อมต่อ" (Connected), "สร้าง" (Created) DB, "สร้าง" (Created) Table, และ "ใส่" (Inserted) ข้อมูล... "สำเร็จ" (Complete) 100%!'
    });

  } catch (error) {
    // 11. "จัดการ" (Handle) กรณี "พัง" (Error)
    console.error('Database Connection Error (v5):', error.message);
    res.status(500).json({
        message: 'Error (v5): ไม่สามารถ "เชื่อมต่อ" (Connect) หรือ "เขียน" (Write) ฐานข้อมูล (DB) ได้',
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