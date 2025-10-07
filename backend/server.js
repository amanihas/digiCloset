require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const User = require("./models/User");

// --- CLOTHING SCHEMA ---
const clothingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  image: { type: String },
  timesWorn: { type: Number, default: 0 },
  sustainabilityScore: { type: Number, default: 100 },
});

const Clothing = mongoose.model("Clothing", clothingSchema);

// --- AUTH MIDDLEWARE ---
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// --- AUTH ROUTES ---
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Username taken" });

    const user = new User({ username, password });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- CLOTHING ROUTES ---
app.get("/api/clothes", authMiddleware, async (req, res) => {
  const clothes = await Clothing.find({ userId: req.userId });
  res.json(clothes);
});

app.post("/api/clothes", authMiddleware, async (req, res) => {
  const { name, image } = req.body;
  const newClothing = new Clothing({ userId: req.userId, name, image });
  await newClothing.save();
  res.json(newClothing);
});

app.put("/api/clothes/:id", authMiddleware, async (req, res) => {
  const clothing = await Clothing.findById(req.params.id);
  if (!clothing) return res.status(404).json({ error: "Clothing not found" });

  clothing.timesWorn += 1;
  clothing.sustainabilityScore = Math.max(
    0,
    clothing.sustainabilityScore - 5
  );
  await clothing.save();
  res.json(clothing);
});

app.delete("/api/clothes/:id", authMiddleware, async (req, res) => {
  await Clothing.findByIdAndDelete(req.params.id);
  res.json({ message: "Clothing deleted" });
});

app.get("/", (req, res) => {
  res.send("🚀 digiCloset backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
