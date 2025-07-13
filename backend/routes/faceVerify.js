import dotenv from "dotenv";
dotenv.config();
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Canvas, Image, ImageData, loadImage } from "canvas";
import * as faceapi from "face-api.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cloudinary from "../config/cloudinary.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Monkey patch for Node.js canvas support in face-api
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = path.join(__dirname, "../models");
let modelsLoaded = false;

// ✅ Load models from disk
const loadModels = async () => {
  if (modelsLoaded) return;
  try {
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
    console.log("✅ Face-api models loaded successfully.");
    modelsLoaded = true;
  } catch (err) {
    console.error("❌ Error loading face-api models:", err);
  }
};

await loadModels(); // Load on import

// ✅ Health Check Route
router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// ✅ Upload Face Image Route
router.post("/upload", upload.single("face"), async (req, res) => {
  console.log("📩 /api/face/upload endpoint hit");

  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "Face image is required." });
    }

    console.log("📂 Face image received:", file.originalname);
    console.log("📂 File path:", file.path);
    console.log("📂 File size:", file.size);

    // Load image to verify it's a valid face
    let image;
    try {
      image = await loadImage(file.path);
      console.log("✅ Image loaded successfully");
    } catch (err) {
      console.error("❌ Error loading image:", err);
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: "Invalid image format." });
    }

    // Detect face in the image
    const face = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!face || !face.descriptor) {
      console.log("❌ No face detected in image");
      fs.unlinkSync(file.path);
      return res.status(400).json({
        error: "No face detected in the image. Please upload a clear face photo.",
      });
    }

    console.log("✅ Face detected successfully");

    // Upload to Cloudinary
    console.log("📤 Starting Cloudinary upload...");
    console.log("📤 Cloudinary config check:");
    console.log("📤 cloud_name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("📤 api_key exists:", !!process.env.CLOUDINARY_API_KEY);
    console.log("📤 api_secret exists:", !!process.env.CLOUDINARY_API_SECRET);

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "faces",
      resource_type: "image",
    });

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    // Clean up local file
    fs.unlinkSync(file.path);

    return res.status(200).json({
      success: true,
      faceUrl: result.secure_url,
      message: "Face image uploaded successfully.",
    });
  } catch (err) {
    console.error("❌ Face upload error:", err);
    console.error("❌ Error stack:", err.stack);
    console.error("❌ Error message:", err.message);
    // Clean up file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Internal server error." });
  }
});

// ✅ Face Verification Route
router.post(
  "/verify",
  upload.fields([{ name: "image1" }, { name: "image2" }]),
  async (req, res) => {
    console.log("📩 /api/face/verify endpoint hit");

    try {
      const file1 = req.files?.image1?.[0];
      const file2 = req.files?.image2?.[0];

      if (!file1 || !file2) {
        return res.status(400).json({ error: "Both images are required." });
      }

      console.log("📂 Images received:", file1.originalname, file2.originalname);

      // Load images
      let image1, image2;
      try {
        image1 = await loadImage(file1.path);
        image2 = await loadImage(file2.path);
      } catch (err) {
        fs.unlinkSync(file1.path);
        fs.unlinkSync(file2.path);
        return res.status(400).json({ error: "Invalid image format." });
      }

      // Detect faces
      const face1 = await faceapi
        .detectSingleFace(image1)
        .withFaceLandmarks()
        .withFaceDescriptor();

      const face2 = await faceapi
        .detectSingleFace(image2)
        .withFaceLandmarks()
        .withFaceDescriptor();

      // Clean up
      fs.unlinkSync(file1.path);
      fs.unlinkSync(file2.path);

      if (!face1 || !face2 || !face1.descriptor || !face2.descriptor) {
        return res.status(400).json({
          match: false,
          message: "Face not detected in one or both images.",
        });
      }

      let distance;
      try {
        distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor);
      } catch (e) {
        return res.status(500).json({
          match: false,
          message: "Failed to calculate face distance.",
        });
      }

      return res.status(200).json({
        match: distance < 0.6,
        distance: parseFloat(distance.toFixed(4)),
      });
    } catch (err) {
      console.error("❌ Face verification error:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

export default router;
