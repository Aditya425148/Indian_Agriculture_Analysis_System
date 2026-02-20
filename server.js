const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
// DATABASE CONNECTION
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// SERVE HTML FILES
app.use(express.static(path.join(__dirname, "../public")));

// API: Top States
app.get("/api/top-states", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.state_name,
             SUM(p.production_tonnes) AS total_production
      FROM production p
      JOIN district d ON p.district_id = d.district_id
      JOIN state s ON d.state_id = s.state_id
      GROUP BY s.state_name
      ORDER BY total_production DESC
      LIMIT 10
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// API: Year Trend
app.get("/api/year-trend", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT year,
             SUM(production_tonnes) AS total_production
      FROM production
      GROUP BY year
      ORDER BY year
    `);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/state-comparison", async (req, res) => {
  try {
    const { states, crop, year } = req.query;

    const stateArray = states.split(",");

    const result = await pool.query(`
      SELECT s.state_name,
             SUM(p.production_tonnes) AS total_production,
             SUM(p.area_hectare) AS total_area,
             AVG(p.yield) AS avg_yield
      FROM production p
      JOIN district d ON p.district_id = d.district_id
      JOIN state s ON d.state_id = s.state_id
      JOIN crop c ON p.crop_id = c.crop_id
      WHERE s.state_name = ANY($1)
      AND c.crop_name = $2
      AND p.year = $3
      GROUP BY s.state_name
      ORDER BY total_production DESC
    `, [stateArray, crop, year]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// Get States
app.get("/api/states", async (req, res) => {
  const result = await pool.query("SELECT state_name FROM state ORDER BY state_name");
  res.json(result.rows);
});

// Get Crops
app.get("/api/crops", async (req, res) => {
  const result = await pool.query("SELECT crop_name FROM crop ORDER BY crop_name");
  res.json(result.rows);
});

// Get Years
app.get("/api/years", async (req, res) => {
  const result = await pool.query("SELECT DISTINCT year FROM production ORDER BY year");
  res.json(result.rows);
});
// Crop Analysis Route
app.get("/api/crop-analysis", async (req, res) => {
  try {
    const { crop, year } = req.query;

    const result = await pool.query(`
      SELECT s.state_name,
             SUM(p.production_tonnes) AS total_production,
             SUM(p.area_hectare) AS total_area,
             AVG(p.yield) AS avg_yield
      FROM production p
      JOIN district d ON p.district_id = d.district_id
      JOIN state s ON d.state_id = s.state_id
      JOIN crop c ON p.crop_id = c.crop_id
      WHERE c.crop_name = $1
      AND p.year = $2
      GROUP BY s.state_name
      ORDER BY total_production DESC
      LIMIT 10
    `, [crop, year]);

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);