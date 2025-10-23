const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Double-check directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      
      // Preserve the original file extension exactly as it is
      const fileExtension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, fileExtension);
      
      // Minimal sanitization to preserve file integrity
      const safeName = baseName
        .replace(/[<>:"/\\|?*]/g, '_') // Only replace truly problematic characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
      
      const finalName = `${uniqueSuffix}-${safeName}${fileExtension}`;
      console.log('File upload:', {
        original: file.originalname,
        generated: finalName,
        mimetype: file.mimetype,
        size: file.size
      });
      cb(null, finalName);
    } catch (error) {
      console.error('Filename generation error:', error);
      cb(error);
    }
  },
});

const fileFilter = (req, file, cb) => {
  console.log('File filter check:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    encoding: file.encoding
  });

  // Strict PDF-only filter to prevent corruption
  const allowedMimeTypes = [
    'application/pdf'
  ];

  // Also check file extension as backup
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf'];

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    console.log('File accepted:', file.originalname);
    cb(null, true);
  } else {
    const error = new Error(`Only PDF files are allowed. Received: ${file.mimetype} with extension ${fileExtension}`);
    error.code = 'INVALID_FILE_TYPE';
    console.log('File rejected:', error.message);
    cb(error, false);
  }
};

const parser = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 1, // Only allow 1 file at a time
    fieldSize: 50 * 1024 * 1024 // Increase field size limit
  },
  preservePath: false, // Don't preserve the full path
  onError: (err, next) => {
    console.error('Multer error:', err);
    next(err);
  }
});

// Function to verify PDF file integrity
const verifyPDFFile = (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // Check PDF magic number (first 4 bytes should be %PDF)
    const pdfHeader = buffer.slice(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      console.error('Invalid PDF header:', pdfHeader);
      return false;
    }
    
    // Check for PDF trailer
    const fileContent = buffer.toString('binary');
    if (!fileContent.includes('%%EOF')) {
      console.error('PDF trailer not found');
      return false;
    }
    
    console.log('PDF file verification passed');
    return true;
  } catch (error) {
    console.error('PDF verification error:', error);
    return false;
  }
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'File too large. Maximum size is 50MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files. Only 1 file allowed.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected file field.',
          error: 'UNEXPECTED_FILE'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          message: 'Field value too large.',
          error: 'FIELD_TOO_LARGE'
        });
      default:
        return res.status(400).json({
          message: 'File upload error.',
          error: err.code || 'UPLOAD_ERROR'
        });
    }
  } else if (err && err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      message: err.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  next(err);
};

// Middleware to verify uploaded PDF
const verifyUploadedPDF = (req, res, next) => {
  if (req.file) {
    const isValidPDF = verifyPDFFile(req.file.path);
    if (!isValidPDF) {
      // Delete the invalid file
      try {
        fs.unlinkSync(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting invalid file:', deleteError);
      }
      
      return res.status(400).json({
        message: 'Uploaded file is not a valid PDF or is corrupted.',
        error: 'INVALID_PDF'
      });
    }
  }
  next();
};

module.exports = { parser, handleMulterError, verifyUploadedPDF };
