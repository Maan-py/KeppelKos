const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect((err, client, release) => {
  if (err) {
    console.log("Terjadi error saat koneksi ke database", err);
  } else {
    console.log("Berhasil terhubung ke database");
  }

  if (client) release();
});
