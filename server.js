const pool = require("./db");
const express = require("express");
const axios = require("axios");
const cors = require("cors");   

const app = express();
app.use(cors());
const PORT = 5000;

// Function to check APIs from DB and log results
async function checkApis() {
  try {
    const dbResult = await pool.query("SELECT id, url FROM apis");
    console.log("APIs fetched from DB:", dbResult.rows.length);

    if (!dbResult.rows.length) {
      throw new Error("No APIs found in DB");
    }

    let working = 0;
    let down = 0;
    const results = [];

    for (let api of dbResult.rows) {
      const start = Date.now();
      let status = "";
      let responseTime = "";

      try {
        await axios.get(api.url);
        responseTime = Date.now() - start + " ms";
        status = "working";
        working++;
      } catch (err) {
        status = "down";
        responseTime = "failed";
        down++;
      }

      // Save check to monitor_logs
      await pool.query(
        "INSERT INTO monitor_logs (api_id, status, response_time) VALUES ($1, $2, $3)",
        [api.id, status, responseTime]
      );

      results.push({ url: api.url, status, responseTime });
    }

    return { totalApis: dbResult.rows.length, working, down, results };
  } catch (err) {
    console.error("checkApis error:", err.message);
    throw err;
  }
}
app.get("/api/status", async (req, res) => {
  try {
    const result = await checkApis();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch API status" });
  }
});

// Optional route to test DB connection
// server.js
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ dbTime: result.rows[0] });
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});