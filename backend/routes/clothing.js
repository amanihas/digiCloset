import express from "express";
import Clothing from "../models/Clothing.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Helper function to calculate sustainability score
function calculateSustainabilityScore(material, category) {
  const mat = (material || "").toLowerCase();
  const cat = (category || "").toLowerCase();
  let score = 100;

  // Material-based scoring
  if (mat.includes("polyester") || mat.includes("nylon") || mat.includes("synthetic")) {
    score = 60;
  } else if (mat.includes("cotton") && !mat.includes("organic")) {
    score = 85;
  } else if (mat.includes("organic") || mat.includes("linen") || mat.includes("wool") || mat.includes("recycled")) {
    score = 95;
  } else if (mat.includes("denim")) {
    score = 75;
  }

  // Category-based adjustments
  if (cat.includes("fast") || cat.includes("cheap")) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

// GET all clothing items for authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const clothes = await Clothing.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(clothes);
  } catch (err) {
    console.error("Fetch clothes error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST create new clothing item
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, image, material, category, color, brand, purchaseDate } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Name is required" });
    }

    // Calculate initial sustainability score
    const sustainabilityScore = calculateSustainabilityScore(material, category);

    const clothing = new Clothing({
      userId: req.userId,
      name: name.trim(),
      image,
      material: material || "N/A",
      category: category || "N/A",
      color,
      brand,
      purchaseDate,
      sustainabilityScore,
      timesWorn: 0,
    });

    await clothing.save();
    res.status(201).json(clothing);
  } catch (err) {
    console.error("Create clothing error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT update clothing item
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ msg: "Clothing item not found" });
    }

    if (clothing.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Forbidden: You don't own this item" });
    }

    const { name, material, category, color, brand, purchaseDate, timesWorn } = req.body;

    // Update fields if provided
    if (name !== undefined) clothing.name = name;
    if (material !== undefined) clothing.material = material;
    if (category !== undefined) clothing.category = category;
    if (color !== undefined) clothing.color = color;
    if (brand !== undefined) clothing.brand = brand;
    if (purchaseDate !== undefined) clothing.purchaseDate = purchaseDate;
    if (timesWorn !== undefined) clothing.timesWorn = timesWorn;

    // Recalculate sustainability score if material or category changed
    if (material !== undefined || category !== undefined) {
      clothing.sustainabilityScore = calculateSustainabilityScore(
        clothing.material,
        clothing.category
      );
    }

    await clothing.save();
    res.json(clothing);
  } catch (err) {
    console.error("Update clothing error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT increment times worn
router.put("/:id/wear", authMiddleware, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ msg: "Clothing item not found" });
    }

    if (clothing.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Forbidden: You don't own this item" });
    }

    clothing.timesWorn += 1;
    // Slightly decrease sustainability score with wear
    clothing.sustainabilityScore = Math.max(0, clothing.sustainabilityScore - 2);

    await clothing.save();
    res.json(clothing);
  } catch (err) {
    console.error("Update wear error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE clothing item
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);

    if (!clothing) {
      return res.status(404).json({ msg: "Clothing item not found" });
    }

    if (clothing.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Forbidden: You don't own this item" });
    }

    await Clothing.findByIdAndDelete(req.params.id);
    res.json({ msg: "Clothing item deleted successfully" });
  } catch (err) {
    console.error("Delete clothing error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
