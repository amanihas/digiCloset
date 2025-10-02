const mongoose = require("mongoose");

const ClothingSchema = new mongoose.Schema({
  uri: { type: String, required: true },  // image link
  wears: { type: Number, default: 0 },    // times worn
  category: { type: String, default: "N/A" },
}, { timestamps: true });

module.exports = mongoose.model("Clothing", ClothingSchema);
