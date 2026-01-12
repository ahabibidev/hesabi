// scripts/migrate-db.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function migrateDatabase() {
  const dbPath = path.join(__dirname, "../database.db");
  const db = new Database(dbPath);

  console.log("🚀 Starting database migration...\n");

  try {
    // Enable foreign keys
    db.exec("PRAGMA foreign_keys = ON");

    // ============================================
    // STEP 1: Update users table
    // ============================================
    console.log("📋 Step 1: Checking users table...");

    const userColumns = db.prepare("PRAGMA table_info(users)").all();
    const existingUserCols = userColumns.map((col) => col.name);

    const userColumnsToAdd = [
      { name: "avatar", definition: "TEXT DEFAULT '/avatars/user.png'" },
      { name: "currency", definition: "TEXT DEFAULT 'USD'" },
      { name: "theme", definition: "TEXT DEFAULT 'light'" },
      { name: "updated_at", definition: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
    ];

    for (const col of userColumnsToAdd) {
      if (!existingUserCols.includes(col.name)) {
        db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`);
        console.log(`   ✓ Added column: ${col.name}`);
      } else {
        console.log(`   ✓ Column exists: ${col.name}`);
      }
    }

    // Drop old trigger
    db.exec("DROP TRIGGER IF EXISTS update_user_timestamp");

    // ============================================
    // STEP 2: Create categories table
    // ============================================
    console.log("\n📋 Step 2: Creating categories table...");

    db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
        icon TEXT DEFAULT 'default',
        color TEXT DEFAULT '#6B7280',
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Categories table ready");

    // Insert default categories
    const existingDefaults = db
      .prepare("SELECT COUNT(*) as count FROM categories WHERE is_default = 1")
      .get();

    if (existingDefaults.count === 0) {
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

      const insertCat = db.prepare(`
        INSERT INTO categories (user_id, name, type, icon, color, is_default)
        VALUES (NULL, ?, ?, ?, ?, 1)
      `);

      for (const cat of defaultCategories) {
        insertCat.run(cat.name, cat.type, cat.icon, cat.color);
      }
      console.log(
        `   ✓ Inserted ${defaultCategories.length} default categories`
      );
    } else {
      console.log("   ✓ Default categories already exist");
    }

    // ============================================
    // STEP 3: Create transactions table
    // ============================================
    console.log("\n📋 Step 3: Creating transactions table...");

    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        amount DECIMAL(10, 2) NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        date DATE NOT NULL,
        recurring BOOLEAN DEFAULT 0,
        recurring_interval TEXT CHECK(recurring_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log("   ✓ Transactions table ready");

    // ============================================
    // STEP 4: Create budgets table
    // ============================================
    console.log("\n📋 Step 4: Creating budgets table...");

    db.exec(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER,
        name TEXT NOT NULL,
        max_amount DECIMAL(10, 2) NOT NULL,
        color TEXT DEFAULT '#0d9488',
        period TEXT DEFAULT 'monthly' CHECK(period IN ('weekly', 'monthly', 'yearly')),
        start_date DATE,
        end_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);
    console.log("   ✓ Budgets table ready");

    // ============================================
    // STEP 5: Create pots table
    // ============================================
    console.log("\n📋 Step 5: Creating pots table...");

    db.exec(`
      CREATE TABLE IF NOT EXISTS pots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        target_amount DECIMAL(10, 2) NOT NULL,
        saved_amount DECIMAL(10, 2) DEFAULT 0,
        color TEXT DEFAULT '#3B82F6',
        icon TEXT DEFAULT 'piggy-bank',
        deadline DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Pots table ready");

    // ============================================
    // STEP 6: Create pot_transactions table
    // ============================================
    console.log("\n📋 Step 6: Creating pot_transactions table...");

    db.exec(`
      CREATE TABLE IF NOT EXISTS pot_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pot_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pot_id) REFERENCES pots(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ Pot transactions table ready");

    // ============================================
    // STEP 7: Create indexes
    // ============================================
    console.log("\n📋 Step 7: Creating indexes...");

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
      CREATE INDEX IF NOT EXISTS idx_pots_user_id ON pots(user_id);
      CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_pot_transactions_pot ON pot_transactions(pot_id);
    `);
    console.log("   ✓ Indexes created");

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(50));

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      )
      .all();
    console.log("\nTables:", tables.map((t) => t.name).join(", "));

    for (const table of tables) {
      const count = db
        .prepare(`SELECT COUNT(*) as count FROM ${table.name}`)
        .get();
      const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
      console.log(`\n${table.name}: ${count.count} rows`);
      console.log(`   Columns: ${columns.map((c) => c.name).join(", ")}`);
    }

    console.log("\n✅ Database migration completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    db.close();
  }
}

migrateDatabase();
