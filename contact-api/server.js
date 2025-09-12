import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { z } from "zod";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json({ limit: "32kb" }));

// ----- CORS (origins whitelist + localhost option) -----
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOW_LOCALHOST = process.env.CORS_ALLOW_LOCALHOST === "true";

const isLocalOrigin = (origin = "") => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(
  cors({
    origin(origin, cb) {
      // Requêtes sans Origin (curl/Postman/serveur→serveur) : autorisées
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      if (ALLOW_LOCALHOST && isLocalOrigin(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use("/messages", rateLimit({ windowMs: 5 * 60 * 1000, max: 8 }));

await mongoose.connect(process.env.MONGODB_URI);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
    {
      name: String,
      email: String,
      company: String,
      subject: String,
      message: String,
      ip: String,
      ua: String,
    },
    { timestamps: true }
  )
);

const Subject = z.enum(["client", "job", "other"]);
const Input = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[\p{L}\s'’-]{2,}$/u),
  email: z.string().email().max(200),
  company: z.string().max(120).optional().nullable(),
  subject: Subject,
  message: z.string().min(10).max(1200),
  hp: z.string().optional().nullable(),
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/messages", async (req, res) => {
  const p = Input.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: "validation", details: p.error.flatten() });
  if (p.data.hp) return res.status(204).end();
  const doc = await Message.create({
    ...p.data,
    company: p.data.company || "",
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    ua: req.headers["user-agent"] || "",
  });
  res.status(201).json({ id: doc._id });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
