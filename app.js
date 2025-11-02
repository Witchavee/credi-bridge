// 1. นำเข้าเครื่องปรุง (Express)
const express = require('express');
const app = express();
const port = 3000;

// 2. (ของใหม่!) "ตัวแปลภาษา" (Middleware)
//    นี่คือบรรทัด "เวทมนตร์" ที่บอกให้ Express
//    เข้าใจข้อมูล (JSON) ที่ส่งมาจาก Frontend ครับ
app.use(express.json());

// 3. "สูตรอาหาร" (เส้นทาง)
//    หน้าแรก (GET) ยังทำงานเหมือนเดิม
app.get('/', (req, res) => {
  res.send('Hello from Credi-Bridge! My app is working! We are here for help calcula...');
});

// 4. (ของใหม่!) "เส้นทางสำหรับสมอง" (API Endpoint)
//    นี่คือ "ประตู" ใหม่สำหรับรับคำสั่ง 'คำนวณ'
//    เราใช้ app.post (ไม่ใช่ .get) เพราะเราต้อง "รับ" ข้อมูลมาประมวลผล
app.post('/api/calculate-score', (req, res) => {
  
  // 5. "จำลอง" การอ่านข้อมูล
  // (ในอนาคต เราจะรับข้อมูลจาก req.body เช่น ID ร้านค้า)
  // const shopId = req.body.shopId;
  console.log('ได้รับคำสั่ง /api/calculate-score!');

  // 6. "จำลอง" (Mock) การคำนวณคะแนน
  // (ในอนาคต ตรงนี้คือจุดที่เราจะยิงไปหา Pangu AI)
  const mockScore = 780;
  const mockGrade = 'B+';

  // 7. "ส่งคำตอบ" กลับไป
  //    API ที่ดีจะตอบกลับเป็น JSON (ไม่ใช่ Text ธรรมดา)
  res.json({
    message: 'คำนวณคะแนนสำเร็จ',
    score: mockScore,
    grade: mockGrade
  });
});

// 8. "เปิดร้าน" (เริ่มรันเซิร์ฟเวอร์)
app.listen(port, () => {
  console.log(`Credi-Bridge app listening on http://localhost:${port}`);
});