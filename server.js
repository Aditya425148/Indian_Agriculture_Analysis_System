const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = async (req, res) => {
  try {
    const { url, query } = req;

    // -------- TOP STATES --------
    if (url.startsWith("/api/top-states")) {
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
      return res.status(200).json(result.rows);
    }

    // -------- YEAR TREND --------
    if (url.startsWith("/api/year-trend")) {
      const result = await pool.query(`
        SELECT year,
               SUM(production_tonnes) AS total_production
        FROM production
        GROUP BY year
        ORDER BY year
      `);
      return res.status(200).json(result.rows);
    }

    // -------- STATE COMPARISON --------
    if (url.startsWith("/api/state-comparison")) {
      const { states, crop, year } = query;
      const stateArray = states.split(",");

      const result = await pool.query(
        `
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
      `,
        [stateArray, crop, year]
      );

      return res.status(200).json(result.rows);
    }

    // -------- STATES LIST --------
    if (url.startsWith("/api/states")) {
      const result = await pool.query(
        "SELECT state_name FROM state ORDER BY state_name"
      );
      return res.status(200).json(result.rows);
    }

    // -------- CROPS LIST --------
    if (url.startsWith("/api/crops")) {
      const result = await pool.query(
        "SELECT crop_name FROM crop ORDER BY crop_name"
      );
      return res.status(200).json(result.rows);
    }

    // -------- YEARS LIST --------
    if (url.startsWith("/api/years")) {
      const result = await pool.query(
        "SELECT DISTINCT year FROM production ORDER BY year"
      );
      return res.status(200).json(result.rows);
    }

    // -------- CROP ANALYSIS --------
    if (url.startsWith("/api/crop-analysis")) {
      const { crop, year } = query;

      const result = await pool.query(
        `
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
      `,
        [crop, year]
      );

      return res.status(200).json(result.rows);
    }

    return res.status(404).json({ error: "Route not found" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }
};
