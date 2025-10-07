import express from "express";
import jwt from "jsonwebtoken";
import Clothing from "../models/Clothing.js";

const router = express.Router();

// Middleware to verify token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
}

// Get all clothes
router.get("/", authMiddleware, async (req, res) => {
  const clothes = await Clothing.find({ userId: req.userId });
  res.json(clothes);
});

// Add clothing
router.post("/", authMiddleware, async (req, res) => {
  const { name, image, category } = req.body;
  const clothing = new Clothing({ name, image, category, userId: req.userId });
  await clothing.save();
  res.json(clothing);
});

// Update times worn
router.put("/:id", authMiddleware, async (req, res) => {
  const clothing = await Clothing.findById(req.params.id);
  if (!clothing) return res.status(404).json({ msg: "Not found" });

  clothing.timesWorn += 1;
  clothing.sustainabilityScore = Math.max(0, clothing.sustainabilityScore - 5);
  await clothing.save();
  res.json(clothing);
});

// Delete clothing
router.delete("/:id", authMiddleware, async (req, res) => {
  await Clothing.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

export default router;
