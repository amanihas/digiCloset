const express = require("express");
const router = express.Router();
const Clothing = require("../models/Clothing");

// Get all clothes
router.get("/", async (req, res) => {
  const clothes = await Clothing.find();
  res.json(clothes);
});

// Add clothing item
router.post("/", async (req, res) => {
  const { uri, wears, category } = req.body;
  const clothing = new Clothing({ uri, wears, category });
  await clothing.save();
  res.json(clothing);
});

// Update wears
router.put("/:id", async (req, res) => {
  const { wears, category } = req.body;
  const clothing = await Clothing.findByIdAndUpdate(
    req.params.id,
    { wears, category },
    { new: true }
  );
  res.json(clothing);
});

// Delete clothing item
router.delete("/:id", async (req, res) => {
  await Clothing.findByIdAndDelete(req.params.id);
  res.json({ message: "Clothing item deleted" });
});

module.exports = router;
