const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get("/health", async (req, res) => {
  try { await pool.query("SELECT 1"); res.json({ status: "ok" }); }
  catch (e) { res.status(500).json({ status: "db down" }); }
});
app.get("/notes", async (req, res) => {
  const r = await pool.query("SELECT id, text FROM notes ORDER BY id");
  res.json(r.rows);
});
app.post("/notes", async (req, res) => {
  const r = await pool.query("INSERT INTO notes(text) VALUES($1) RETURNING id, text", [req.body.text]);
  res.status(201).json(r.rows[0]);
});

pool.query("CREATE TABLE IF NOT EXISTS notes (id SERIAL PRIMARY KEY, text TEXT NOT NULL)")
  .then(() => app.listen(3000, "0.0.0.0", () => console.log("listening on 3000")))
  .catch((e) => { console.error(e); process.exit(1); });
