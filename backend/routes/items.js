import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import Item from "../models/Item.js";

dotenv.config();
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const fileStr = req.body.image;
    const uploaded = await cloudinary.v2.uploader.upload(fileStr, {
      folder: "digiCloset",
    });

    const newItem = new Item({
      name: req.body.name,
      category: req.body.category,
      image: uploaded.secure_url,
    });

    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ msg: "Upload failed", error: err });
  }
});

router.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

export default router;
