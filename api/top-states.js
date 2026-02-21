const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
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

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
