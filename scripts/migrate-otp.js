// scripts/migrate-otp.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function migrateDatabase() {
  const dbPath = path.join(__dirname, "../database.db");
  const db = new Database(dbPath);

  console.log("Starting OTP migration...\n");

  try {
    // Create OTP table
    console.log("Creating otp_codes table...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ otp_codes table created");

    // Create OTP rate limiting table
    console.log("Creating otp_rate_limits table...");
    db.exec(`
      CREATE TABLE IF NOT EXISTS otp_rate_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        request_count INTEGER DEFAULT 0,
        first_request_at DATETIME,
        last_request_at DATETIME,
        blocked_until DATETIME
      )
    `);
    console.log("✓ otp_rate_limits table created");

    // Add email_verified column to users table if not exists
    const userTableInfo = db.prepare("PRAGMA table_info(users)").all();
    const hasEmailVerified = userTableInfo.some(
      (col) => col.name === "email_verified"
    );

    if (!hasEmailVerified) {
      console.log("Adding email_verified column to users table...");
      db.exec("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0");
      console.log("✓ email_verified column added");

      // Mark existing users as verified (optional)
      db.exec(
        "UPDATE users SET email_verified = 1 WHERE provider != 'credentials' OR provider IS NULL"
      );
      console.log("✓ Existing OAuth users marked as verified");
    } else {
      console.log("✓ email_verified column already exists");
    }

    // Create indexes for better performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
      CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_codes(expires_at);
      CREATE INDEX IF NOT EXISTS idx_rate_limit_email ON otp_rate_limits(email);
    `);
    console.log("✓ Indexes created");

    console.log("\n✓ OTP migration completed successfully!");
  } catch (error) {
    console.error("✗ Migration failed:", error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateDatabase();
