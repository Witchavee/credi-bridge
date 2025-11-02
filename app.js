// 1. นำเข้าเครื่องปรุง (Express)
const express = require('express');
const app = express();

// 2. ตั้งค่า Port (นี่คือ "ประตูหลังบ้าน" ในครัวของเรา)
//    เราจะใช้ Port 3000 เป็นมาตรฐานครับ
const port = 3000;

// 3. สร้าง "สูตรอาหาร" (ตั้งค่าเส้นทาง)
//    ถ้ามีคนมาที่หน้าแรก ('/') ให้ส่งข้อความว่า 'Hello!'
app.get('/', (req, res) => {
  res.send('Hello from Credi-Bridge! My app is working!');
});

// 4. สั่งให้ "เปิดร้าน" (เริ่มรันเซิร์ฟเวอร์)
app.listen(port, () => {
  console.log(`Credi-Bridge app listening on http://localhost:${port}`);
});