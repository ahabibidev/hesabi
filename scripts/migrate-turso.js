// scripts/migrate-turso.js
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root (changed from .env)
config({ path: resolve(__dirname, "../.env.local") });

// Debug: Check if env vars are loaded
console.log("🔍 Checking environment variables...");
console.log(
  "   TURSO_DATABASE_URL:",
  process.env.TURSO_DATABASE_URL ? "✓ Found" : "✗ Missing",
);
console.log(
  "   TURSO_AUTH_TOKEN:",
  process.env.TURSO_AUTH_TOKEN ? "✓ Found" : "✗ Missing",
);

// Validate environment variables
if (!process.env.TURSO_DATABASE_URL) {
  console.error("\n❌ Error: TURSO_DATABASE_URL is not set in .env.local file");
  process.exit(1);
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.error("\n❌ Error: TURSO_AUTH_TOKEN is not set in .env.local file");
  process.exit(1);
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function migrateTursoDatabase() {
  console.log("\n🚀 Starting Turso database migration...\n");

  try {
    // ============================================
    // STEP 1: Create users table
    // ============================================
    console.log("📋 Step 1: Creating users table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT,
        last_name TEXT,
        avatar TEXT DEFAULT '/avatars/user.png',
        oauth_avatar TEXT,
        currency TEXT DEFAULT 'USD',
        theme TEXT DEFAULT 'light',
        provider TEXT DEFAULT 'credentials',
        email_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("   ✓ Users table ready");

    // ============================================
    // STEP 2: Create accounts table (for OAuth)
    // ============================================
    console.log("\n📋 Step 2: Creating accounts table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Accounts table ready");

    // ============================================
    // STEP 3: Create categories table
    // ============================================
    console.log("\n📋 Step 3: Creating categories table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
        icon TEXT DEFAULT 'default',
        color TEXT DEFAULT '#6B7280',
        is_default INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Categories table ready");

    // Check and insert default categories
    const existingDefaults = await db.execute(
      "SELECT COUNT(*) as count FROM categories WHERE is_default = 1",
    );

    const count = Number(existingDefaults.rows[0].count);

    if (count === 0) {
      console.log("   → Inserting default categories...");

      const defaultCategories = [
        {
          name: "Entertainment",
          type: "expense",
          icon: "film",
          color: "#8B5CF6",
        },
        {
          name: "Groceries",
          type: "expense",
          icon: "shopping-cart",
          color: "#10B981",
        },
        { name: "Dining", type: "expense", icon: "utensils", color: "#F59E0B" },
        {
          name: "Transportation",
          type: "expense",
          icon: "car",
          color: "#3B82F6",
        },
        {
          name: "Shopping",
          type: "expense",
          icon: "shopping-bag",
          color: "#EC4899",
        },
        { name: "Bills", type: "expense", icon: "file-text", color: "#EF4444" },
        {
          name: "Personal Care",
          type: "expense",
          icon: "heart",
          color: "#F43F5E",
        },
        {
          name: "Healthcare",
          type: "expense",
          icon: "activity",
          color: "#06B6D4",
        },
        { name: "Education", type: "expense", icon: "book", color: "#6366F1" },
        { name: "Housing", type: "expense", icon: "home", color: "#84CC16" },
        { name: "Utilities", type: "expense", icon: "zap", color: "#FBBF24" },
        {
          name: "Insurance",
          type: "expense",
          icon: "shield",
          color: "#A855F7",
        },
        {
          name: "Subscriptions",
          type: "expense",
          icon: "repeat",
          color: "#14B8A6",
        },
        { name: "Salary", type: "income", icon: "briefcase", color: "#22C55E" },
        { name: "Freelance", type: "income", icon: "laptop", color: "#3B82F6" },
        {
          name: "Investments",
          type: "income",
          icon: "trending-up",
          color: "#10B981",
        },
        { name: "Gifts", type: "income", icon: "gift", color: "#F43F5E" },
        {
          name: "Refunds",
          type: "income",
          icon: "rotate-ccw",
          color: "#8B5CF6",
        },
        { name: "Bonus", type: "income", icon: "award", color: "#F59E0B" },
        {
          name: "Other",
          type: "both",
          icon: "more-horizontal",
          color: "#6B7280",
        },
        {
          name: "Transfer",
          type: "both",
          icon: "arrow-right-left",
          color: "#64748B",
        },
      ];

      for (const cat of defaultCategories) {
        await db.execute({
          sql: "INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES (NULL, ?, ?, ?, ?, 1)",
          args: [cat.name, cat.type, cat.icon, cat.color],
        });
      }
      console.log(
        `   ✓ Inserted ${defaultCategories.length} default categories`,
      );
    } else {
      console.log("   ✓ Default categories already exist");
    }

    // ============================================
    // STEP 4: Create transactions table
    // ============================================
    console.log("\n📋 Step 4: Creating transactions table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        date TEXT NOT NULL,
        recurring INTEGER DEFAULT 0,
        recurring_interval TEXT CHECK(recurring_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log("   ✓ Transactions table ready");

    // ============================================
    // STEP 5: Create budgets table
    // ============================================
    console.log("\n📋 Step 5: Creating budgets table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        max_amount REAL NOT NULL,
        color TEXT DEFAULT '#0d9488',
        period TEXT DEFAULT 'monthly' CHECK(period IN ('weekly', 'monthly', 'yearly')),
        start_date TEXT,
        end_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log("   ✓ Budgets table ready");

    // ============================================
    // STEP 6: Create pots table
    // ============================================
    console.log("\n📋 Step 6: Creating pots table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS pots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        target_amount REAL NOT NULL,
        saved_amount REAL DEFAULT 0,
        color TEXT DEFAULT '#3B82F6',
        icon TEXT DEFAULT 'piggy-bank',
        deadline TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Pots table ready");

    // ============================================
    // STEP 7: Create pot_transactions table
    // ============================================
    console.log("\n📋 Step 7: Creating pot_transactions table...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS pot_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pot_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
        note TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pot_id) REFERENCES pots(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Pot transactions table ready");

    // ============================================
    // STEP 8: Create OTP tables
    // ============================================
    console.log("\n📋 Step 8: Creating OTP tables...");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS otp_rate_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        request_count INTEGER DEFAULT 0,
        first_request_at INTEGER,
        last_request_at INTEGER,
        blocked_until INTEGER,
        created_at INTEGER
      )
    `);
    console.log("   ✓ OTP tables ready");

    // ============================================
    // STEP 9: Create indexes
    // ============================================
    console.log("\n📋 Step 9: Creating indexes...");

    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)",
      "CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)",
      "CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)",
      "CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_pots_user_id ON pots(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_pot_transactions_pot ON pot_transactions(pot_id)",
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
      "CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email)",
      "CREATE INDEX IF NOT EXISTS idx_rate_limit_email ON otp_rate_limits(email)",
    ];

    for (const idx of indexes) {
      await db.execute(idx);
    }
    console.log("   ✓ Indexes created");

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(50));

    const tables = await db.execute(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%'",
    );

    console.log("\nTables created:");
    for (const table of tables.rows) {
      const countResult = await db.execute(
        `SELECT COUNT(*) as count FROM ${table.name}`,
      );
      console.log(`   ✓ ${table.name}: ${countResult.rows[0].count} rows`);
    }

    console.log("\n✅ Turso database migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateTursoDatabase();
