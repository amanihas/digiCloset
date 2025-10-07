import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
});

export default mongoose.model("Item", itemSchema);
