const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT year,
             SUM(production_tonnes) AS total_production
      FROM production
      GROUP BY year
      ORDER BY year
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};