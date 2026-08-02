const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary (it will automatically pick up CLOUDINARY_URL from env if set)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// 1. Setup Local Disk Storage (Fallback)
const uploadDir = path.join(__dirname, "..", "uploads", "products");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// 2. Setup Cloudinary Storage
let cloudStorage;
try {
  cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "timo-store/products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });
} catch (error) {
  console.warn("Cloudinary not configured properly. Falling back to local storage.");
}

// 3. Dynamic Storage Selector
const dynamicStorage = {
  _handleFile: function (req, file, cb) {
    const useCloudinary = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
    if (useCloudinary && cloudStorage) {
      return cloudStorage._handleFile(req, file, cb);
    }
    return diskStorage._handleFile(req, file, cb);
  },
  _removeFile: function (req, file, cb) {
    const useCloudinary = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);
    if (useCloudinary && cloudStorage) {
      return cloudStorage._removeFile(req, file, cb);
    }
    return diskStorage._removeFile(req, file, cb);
  }
};

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Images only! (jpeg, jpg, png, webp)"));
  }
};

const upload = multer({
  storage: dynamicStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

module.exports = upload;
