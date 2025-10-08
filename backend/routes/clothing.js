import express from "express";
import jwt from "jsonwebtoken";
import Clothing from "../models/Clothing.js";

const router = express.Router();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ msg: "No token provided" });
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
}

// GET clothes for user
router.get("/", authMiddleware, async (req, res) => {
  const clothes = await Clothing.find({ userId: req.userId });
  res.json(clothes);
});

// POST add clothing
router.post("/", authMiddleware, async (req, res) => {
  const { name, image, category } = req.body;
  if (!name) return res.status(400).json({ msg: "Name is required" });

  const clothing = new Clothing({ userId: req.userId, name, image, category });
  await clothing.save();
  res.status(201).json(clothing);
});

// PUT increment wear
router.put("/:id", authMiddleware, async (req, res) => {
  const clothing = await Clothing.findById(req.params.id);
  if (!clothing) return res.status(404).json({ msg: "Not found" });
  if (clothing.userId.toString() !== req.userId) return res.status(403).json({ msg: "Forbidden" });

  clothing.timesWorn += 1;
  clothing.sustainabilityScore = Math.max(0, clothing.sustainabilityScore - 5);
  await clothing.save();
  res.json(clothing);
});

// DELETE
router.delete("/:id", authMiddleware, async (req, res) => {
  const clothing = await Clothing.findById(req.params.id);
  if (!clothing) return res.status(404).json({ msg: "Not found" });
  if (clothing.userId.toString() !== req.userId) return res.status(403).json({ msg: "Forbidden" });

  await Clothing.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
});

export default router;
