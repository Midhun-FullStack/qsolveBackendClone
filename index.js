const express= require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
const {dbCONNECT}=require("./config/dbConfig")
const indexRouter = require('./routes/indexRoutes')



dbCONNECT()

// CORS configuration
app.use(cors({
  origin:[ "http://localhost:5174","http://localhost:5173"], 
  credentials: true
}))

// Body parsing middleware - with size limits and proper configuration
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve uploaded files statically BEFORE API routes
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    // Set proper headers for PDF files
    if (path.extname(filePath).toLowerCase() === '.pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// API routes
app.use("/api",indexRouter)

const port = process.env.PORT || 5000;


app.use((err, req, res, next)=> {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',

    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
})

app.listen(port, () => console.log(`Server running on port ${port} 🔥`))
