require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema + Model
const clothingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String }, // store image URI or URL
  timesWorn: { type: Number, default: 0 },
  sustainabilityScore: { type: Number, default: 100 }, // simple score logic
});

const Clothing = mongoose.model("Clothing", clothingSchema);

// Root route
app.get("/", (req, res) => {
  res.send("🚀 digiCloset backend is running!");
});

// ✅ Get all clothes
app.get("/api/clothes", async (req, res) => {
  try {
    const clothes = await Clothing.find();
    res.json(clothes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch clothes" });
  }
});

// ✅ Add a new clothing item
app.post("/api/clothes", async (req, res) => {
  try {
    const { name, image } = req.body;
    const newClothing = new Clothing({ name, image });
    await newClothing.save();
    res.json(newClothing);
  } catch (err) {
    res.status(500).json({ error: "Failed to add clothing item" });
  }
});

// ✅ Update wear count & sustainability score
app.put("/api/clothes/:id", async (req, res) => {
  try {
    const clothing = await Clothing.findById(req.params.id);
    if (!clothing) return res.status(404).json({ error: "Clothing not found" });

    clothing.timesWorn += 1;
    clothing.sustainabilityScore = Math.max(
      0,
      clothing.sustainabilityScore - 5
    ); // decrease score with each wear
    await clothing.save();

    res.json(clothing);
  } catch (err) {
    res.status(500).json({ error: "Failed to update clothing" });
  }
});

// ✅ Delete clothing item
app.delete("/api/clothes/:id", async (req, res) => {
  try {
    await Clothing.findByIdAndDelete(req.params.id);
    res.json({ message: "Clothing deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete clothing" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
