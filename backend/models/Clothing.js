import mongoose from "mongoose";

const clothingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    image: { type: String }, // base64 or URL
    material: { type: String, default: "N/A" }, // Cotton, Polyester, Wool, etc.
    category: { type: String, default: "N/A" }, // tops, bottoms, dresses, etc.
    color: { type: String },
    brand: { type: String },
    purchaseDate: { type: Date },
    timesWorn: { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("Clothing", clothingSchema);
