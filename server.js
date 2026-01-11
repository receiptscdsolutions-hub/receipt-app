const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG files are allowed'), false);
    }
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'receipts.cdsolutions@gmail.com',
    pass: 'gaun rvzo oqyy kcnv'
  }
});

app.use(express.static('public'));

app.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const extension = req.file.mimetype === 'image/png' ? 'png' : 'jpg';
    const filename = `receipt_${Date.now()}.${extension}`;

    const mailOptions = {
      from: 'receipts.cdsolutions@gmail.com',
      to: 'cdsolutions+expenses@assist.intuit.com',
      subject: `Receipt - ${timestamp}`,
      text: `Receipt uploaded on ${timestamp}`,
      attachments: [
        {
          filename: filename,
          content: req.file.buffer,
          contentType: req.file.mimetype
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Receipt sent!' });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to send receipt' });
  }
});

app.listen(PORT, () => {
  console.log(`Receipt app running on http://localhost:${PORT}`);
});
