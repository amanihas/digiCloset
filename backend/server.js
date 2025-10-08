import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import clothingRoutes from "./routes/clothing.js";
// optional items endpoint if you want server-side uploads later:
// import itemsRoutes from "./routes/items.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // allow larger payloads for images if needed

// connect to mongo
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// debugging logger to see incoming requests (helpful while testing)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/clothes", clothingRoutes);
// app.use("/api/items", itemsRoutes); // optional

app.get("/", (req, res) => res.send("🚀 digiCloset backend is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
