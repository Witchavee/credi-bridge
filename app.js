const express = require('express');
const multer = require('multer');
const path = require('path');

// ส่วนฟังก์ชัน OCR (ตามที่คุณมีอยู่แล้ว)
// ... (code signRequest, callOcrApi)

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = 3000;

// Middleware สำหรับ static file
app.use(express.static(path.join(__dirname, 'public')));

// Route หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route API OCR
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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
