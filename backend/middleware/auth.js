import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = auth.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
}
