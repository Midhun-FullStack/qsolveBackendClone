const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME||"dfjl9sbgz",
  api_key: process.env.CLOUDINARY_API_KEY||"874141227158758",
  api_secret: process.env.CLOUDINARY_API_SECRET||"hgaZ2XiBdfukuJVaNGEOhlZ4NMo"
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads",          
    allowed_formats: ["pdf"],
  },
});

const parser = multer({ storage });

module.exports = parser;
