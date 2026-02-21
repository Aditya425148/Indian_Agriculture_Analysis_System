const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  try {
    const { crop, year } = req.query;

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

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
