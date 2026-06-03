import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { pool } from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    const seedDir = path.join(__dirname, "../src/db/seed");
    const files = fs
      .readdirSync(seedDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const seedPath = path.join(seedDir, file);
      const sql = fs.readFileSync(seedPath, "utf-8");

      await pool.query(sql);

      console.log(`Seed completed: ${file}`);
    }

    console.log("All seed files completed successfully");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
