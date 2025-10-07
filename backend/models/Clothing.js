const mongoose = require("mongoose");

const ClothingSchema = new mongoose.Schema({
  uri: { type: String, required: true },  // image link
  wears: { type: Number, default: 0 },    // times worn
  category: { type: String, default: "N/A" },
}, { timestamps: true });

module.exports = mongoose.model("Clothing", ClothingSchema);

app.get("/api/clothes", authMiddleware, async (req, res) => {
  const clothes = await Clothing.find({ userId: req.userId });
  res.json(clothes);
});

app.post("/api/clothes", authMiddleware, async (req, res) => {
  const { name, image } = req.body;
  const newClothing = new Clothing({ name, image, userId: req.userId });
  await newClothing.save();
  res.json(newClothing);
});

const clothingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  image: { type: String },
  timesWorn: { type: Number, default: 0 },
  sustainabilityScore: { type: Number, default: 100 },
});

