const express= require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
const {dbCONNECT}=require("./config/dbConfig")
const indexRouter = require('./routes/indexRoutes')



dbCONNECT()
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}))
app.use(express.json())
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
