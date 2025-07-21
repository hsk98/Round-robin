// round_robin_server.js – minimal Express API with role‑based auth (no top‑level await)
// Usage: 1) npm install  2) node round_robin_server.js
// Requires .env with JWT_SECRET=<your secret>

import express from "express";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import dotenv from "dotenv";

dotenv.config();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const { JWT_SECRET = "dev_secret_change_me", PORT = 4000 } = process.env;

// ---------------------------------------------------------------------------
// Persistent storage (LowDB – JSON file)
// ---------------------------------------------------------------------------
const defaultData = {
  users: [
    { id: 1, username: "manager", password: "managerpass", role: "admin" },
    { id: 2, username: "sdr1",    password: "sdrpass",    role: "user"  }
  ],
  consultants: [
    { id: 1, name: "Alice", active: true, lastAssigned: 0 },
    { id: 2, name: "Bob",   active: true, lastAssigned: 0 }
  ]
};

const db = new Low(new JSONFile("db.json"), defaultData);

async function initialiseDb() {
  await db.read();              // loads db.json if it exists
  await db.write();             // ensures file is created with defaults
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
function createToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.replace(/^Bearer /, "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

async function getNextConsultant() {
  await db.read();
  const active = db.data.consultants.filter(c => c.active);
  if (!active.length) return null;
  active.sort((a, b) => a.lastAssigned - b.lastAssigned);
  const next = active[0];
  next.lastAssigned = Date.now();
  await db.write();
  return next;
}

// ---------------------------------------------------------------------------
// Bootstrap server (wrapped in async IIFE – keeps Node <14.8 happy)
// ---------------------------------------------------------------------------
(async () => {
  try {
    await initialiseDb();

    const app = express();
    app.use(cors());
    app.use(morgan("dev"));
    app.use(express.json());

    // ---- Auth ----
    app.post("/login", async (req, res) => {
      await db.read();
      const { username, password } = req.body;
      const user = db.data.users.find(u => u.username === username && u.password === password);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      res.json({ token: createToken(user), role: user.role });
    });

    // ---- Consultant management (admin only) ----
    app.get("/consultants", authMiddleware, requireRole("admin"), async (_req, res) => {
      await db.read();
      res.json(db.data.consultants);
    });

    app.post("/consultants", authMiddleware, requireRole("admin"), async (req, res) => {
      await db.read();
      const { name } = req.body;
      const id = db.data.consultants.length ? Math.max(...db.data.consultants.map(c => c.id)) + 1 : 1;
      db.data.consultants.push({ id, name, active: true, lastAssigned: 0 });
      await db.write();
      res.status(201).json({ id, name });
    });

    app.patch("/consultants/:id", authMiddleware, requireRole("admin"), async (req, res) => {
      await db.read();
      const consultant = db.data.consultants.find(c => c.id === Number(req.params.id));
      if (!consultant) return res.status(404).json({ error: "Not found" });
      Object.assign(consultant, req.body);
      await db.write();
      res.json(consultant);
    });

    // ---- Assignment (SDR user) ----
    app.post("/assign", authMiddleware, requireRole("user"), async (_req, res) => {
      const next = await getNextConsultant();
      if (!next) return res.status(409).json({ error: "No active consultants" });
      res.json(next);
    });

    // ---- Health ----
    app.get("/", (_req, res) => res.send("Round‑Robin API is running"));

    app.listen(PORT, () => console.log(`✔️  API listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
