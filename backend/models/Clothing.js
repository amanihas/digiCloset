import mongoose from "mongoose";

const clothingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    image: { type: String },
    category: { type: String, default: "N/A" },
    timesWorn: { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model("Clothing", clothingSchema);
