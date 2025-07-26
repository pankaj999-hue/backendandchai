import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const app = express();

// Correct upload directory
const uploadDir = path.join(process.cwd(), "Public", "temp");

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.post("/test", upload.single("avatar"), (req, res) => {
  res.json({ file: req.file, body: req.body });
});

app.listen(8081, () => console.log("Test server running on port 8081"));
