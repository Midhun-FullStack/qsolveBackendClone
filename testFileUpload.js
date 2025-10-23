const express = require('express');
const { parser, handleMulterError, verifyUploadedPDF } = require('./middleware/multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Test file upload endpoint
app.post('/test-upload', 
  parser.single('file'),
  handleMulterError,
  verifyUploadedPDF,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileInfo = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      destination: req.file.destination
    };

    console.log('File uploaded successfully:', fileInfo);

    // Verify the file exists and is readable
    try {
      const stats = fs.statSync(req.file.path);
      fileInfo.actualSize = stats.size;
      fileInfo.exists = true;
      
      // Read first few bytes to verify it's a PDF
      const buffer = fs.readFileSync(req.file.path, { start: 0, end: 10 });
      fileInfo.header = buffer.toString();
      fileInfo.isPDF = buffer.toString().startsWith('%PDF');
      
    } catch (error) {
      fileInfo.error = error.message;
      fileInfo.exists = false;
    }

    res.json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  }
);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test upload: POST http://localhost:${PORT}/test-upload`);
  console.log(`View files: GET http://localhost:${PORT}/uploads/[filename]`);
});