// lib/db.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

export function getDb() {
  if (!db) {
    const dbPath =
      process.env.NODE_ENV === "production"
        ? "/tmp/database.db"
        : path.join(__dirname, "../database.db");

    db = new Database(dbPath);
    initializeDb(db);
  }
  return db;
}

function initializeDb(database) {
  // Create users table (updated for OAuth)
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT,
      avatar TEXT,
      provider TEXT DEFAULT 'credentials',
      provider_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create accounts table for OAuth (NextAuth standard)
  database.exec(`
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_account_id)
    )
  `);

  // Enable foreign keys
  database.exec("PRAGMA foreign_keys = ON");

  // ============================================
  // USERS TABLE
  // ============================================
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      avatar TEXT DEFAULT '/avatars/user.png',
      currency TEXT DEFAULT 'USD',
      theme TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ============================================
  // CATEGORIES TABLE (predefined + user custom)
  // ============================================
  database.exec(`
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

  // ============================================
  // TRANSACTIONS TABLE
  // ============================================
  database.exec(`
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

  // ============================================
  // BUDGETS TABLE
  // ============================================
  database.exec(`
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

  // ============================================
  // POTS (SAVINGS GOALS) TABLE
  // ============================================
  database.exec(`
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

  // ============================================
  // POT TRANSACTIONS TABLE (track deposits/withdrawals)
  // ============================================
  database.exec(`
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

  // ============================================
  // CREATE INDEXES FOR BETTER PERFORMANCE
  // ============================================
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
    CREATE INDEX IF NOT EXISTS idx_pots_user_id ON pots(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
  `);

  // Insert default categories if they don't exist
  insertDefaultCategories(database);

  // Ensure user table has all columns
  ensureUserColumns(database);
}

function insertDefaultCategories(database) {
  const existingDefaults = database
    .prepare("SELECT COUNT(*) as count FROM categories WHERE is_default = 1")
    .get();

  if (existingDefaults.count === 0) {
    const defaultCategories = [
      // Expense categories
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
      { name: "Insurance", type: "expense", icon: "shield", color: "#A855F7" },
      {
        name: "Subscriptions",
        type: "expense",
        icon: "repeat",
        color: "#14B8A6",
      },
      // Income categories
      { name: "Salary", type: "income", icon: "briefcase", color: "#22C55E" },
      { name: "Freelance", type: "income", icon: "laptop", color: "#3B82F6" },
      {
        name: "Investments",
        type: "income",
        icon: "trending-up",
        color: "#10B981",
      },
      { name: "Gifts", type: "income", icon: "gift", color: "#F43F5E" },
      { name: "Refunds", type: "income", icon: "rotate-ccw", color: "#8B5CF6" },
      { name: "Bonus", type: "income", icon: "award", color: "#F59E0B" },
      // Both
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

    const insertStmt = database.prepare(`
      INSERT INTO categories (user_id, name, type, icon, color, is_default)
      VALUES (NULL, ?, ?, ?, ?, 1)
    `);

    for (const category of defaultCategories) {
      insertStmt.run(
        category.name,
        category.type,
        category.icon,
        category.color
      );
    }

    console.log("Default categories inserted");
  }
}

function ensureUserColumns(database) {
  const columnsToAdd = [
    { name: "avatar", definition: "TEXT DEFAULT '/avatars/user.png'" },
    { name: "currency", definition: "TEXT DEFAULT 'USD'" },
    { name: "theme", definition: "TEXT DEFAULT 'light'" },
    { name: "updated_at", definition: "DATETIME DEFAULT CURRENT_TIMESTAMP" },
  ];

  try {
    const tableInfo = database.prepare("PRAGMA table_info(users)").all();
    const existingColumns = tableInfo.map((col) => col.name);

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        database.exec(
          `ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`
        );
      }
    }
  } catch (error) {
    console.log("Note: Column check error:", error.message);
  }
}

// ============================================
// USER QUERIES
// ============================================
export function getUserByEmail(email) {
  const database = getDb();
  return database.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

export function getUserById(id) {
  const database = getDb();
  return database
    .prepare(
      `SELECT 
        id, 
        email, 
        name,
        last_name,
        COALESCE(avatar, '/avatars/user.png') as avatar,
        COALESCE(currency, 'USD') as currency,
        COALESCE(theme, 'light') as theme,
        created_at 
      FROM users WHERE id = ?`
    )
    .get(id);
}

export function createUser(email, password, name, lastName) {
  const database = getDb();
  const result = database
    .prepare(
      "INSERT INTO users (email, password, name, last_name, provider) VALUES (?, ?, ?, ?, 'credentials')"
    )
    .run(email, password, name, lastName || null);
  return result.lastInsertRowid;
}

export function updateUserProfile(userId, data) {
  const database = getDb();
  const { firstName, lastName, email, avatar, currency, theme } = data;

  return database
    .prepare(
      `UPDATE users SET 
        name = COALESCE(?, name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        avatar = COALESCE(?, avatar),
        currency = COALESCE(?, currency),
        theme = COALESCE(?, theme),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .run(firstName, lastName, email, avatar, currency, theme, userId);
}

// ============================================
// CATEGORY QUERIES
// ============================================
export function getCategories(userId, type = null) {
  const database = getDb();

  let query = `
    SELECT * FROM categories 
    WHERE (user_id = ? OR is_default = 1)
  `;
  const params = [userId];

  if (type) {
    query += ` AND (type = ? OR type = 'both')`;
    params.push(type);
  }

  query += ` ORDER BY is_default DESC, name ASC`;

  return database.prepare(query).all(...params);
}

export function createCategory(userId, name, type, icon, color) {
  const database = getDb();
  const result = database
    .prepare(
      `INSERT INTO categories (user_id, name, type, icon, color) 
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(userId, name, type, icon, color);
  return result.lastInsertRowid;
}

// ============================================
// TRANSACTION QUERIES
// ============================================
export function getTransactions(userId, options = {}) {
  const database = getDb();
  const { limit, offset, type, categoryId, startDate, endDate, search } =
    options;

  let query = `
    SELECT 
      t.*,
      c.name as category_name,
      c.icon as category_icon,
      c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
  `;
  const params = [userId];

  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }

  if (categoryId) {
    query += ` AND t.category_id = ?`;
    params.push(categoryId);
  }

  if (startDate) {
    query += ` AND t.date >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    query += ` AND t.date <= ?`;
    params.push(endDate);
  }

  if (search) {
    query += ` AND (t.name LIKE ? OR t.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY t.date DESC, t.created_at DESC`;

  if (limit) {
    query += ` LIMIT ?`;
    params.push(limit);
  }

  if (offset) {
    query += ` OFFSET ?`;
    params.push(offset);
  }

  return database.prepare(query).all(...params);
}

export function getTransactionById(id, userId) {
  const database = getDb();
  return database
    .prepare(
      `SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ?`
    )
    .get(id, userId);
}

export function createTransaction(userId, data) {
  const database = getDb();
  const {
    categoryId,
    name,
    description,
    amount,
    type,
    date,
    recurring,
    recurringInterval,
  } = data;

  const result = database
    .prepare(
      `INSERT INTO transactions 
        (user_id, category_id, name, description, amount, type, date, recurring, recurring_interval)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      categoryId || null,
      name,
      description || null,
      amount,
      type,
      date,
      recurring ? 1 : 0,
      recurringInterval || null
    );

  return result.lastInsertRowid;
}

export function updateTransaction(id, userId, data) {
  const database = getDb();
  const {
    categoryId,
    name,
    description,
    amount,
    type,
    date,
    recurring,
    recurringInterval,
  } = data;

  return database
    .prepare(
      `UPDATE transactions SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        amount = COALESCE(?, amount),
        type = COALESCE(?, type),
        date = COALESCE(?, date),
        recurring = COALESCE(?, recurring),
        recurring_interval = COALESCE(?, recurring_interval),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`
    )
    .run(
      categoryId,
      name,
      description,
      amount,
      type,
      date,
      recurring !== undefined ? (recurring ? 1 : 0) : null,
      recurringInterval,
      id,
      userId
    );
}

export function deleteTransaction(id, userId) {
  const database = getDb();
  return database
    .prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?")
    .run(id, userId);
}

export function getTransactionStats(userId, startDate, endDate) {
  const database = getDb();

  return database
    .prepare(
      `SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE user_id = ? AND date >= ? AND date <= ?`
    )
    .get(userId, startDate, endDate);
}

// ============================================
// BUDGET QUERIES
// ============================================
export function getBudgets(userId) {
  const database = getDb();

  return database
    .prepare(
      `SELECT 
        b.*,
        c.name as category_name,
        c.icon as category_icon,
        COALESCE(
          (SELECT SUM(t.amount) 
           FROM transactions t 
           WHERE t.user_id = b.user_id 
             AND t.category_id = b.category_id 
             AND t.type = 'expense'
             AND t.date >= date('now', 'start of month')
             AND t.date <= date('now', 'start of month', '+1 month', '-1 day')
          ), 0
        ) as spent
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC`
    )
    .all(userId);
}

export function getBudgetById(id, userId) {
  const database = getDb();
  return database
    .prepare(
      `SELECT 
        b.*,
        c.name as category_name,
        c.icon as category_icon
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? AND b.user_id = ?`
    )
    .get(id, userId);
}

export function createBudget(userId, data) {
  const database = getDb();
  const { categoryId, name, maxAmount, color, period, startDate, endDate } =
    data;

  const result = database
    .prepare(
      `INSERT INTO budgets 
        (user_id, category_id, name, max_amount, color, period, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      categoryId || null,
      name,
      maxAmount,
      color || "#0d9488",
      period || "monthly",
      startDate || null,
      endDate || null
    );

  return result.lastInsertRowid;
}

export function updateBudget(id, userId, data) {
  const database = getDb();
  const { categoryId, name, maxAmount, color, period, startDate, endDate } =
    data;

  return database
    .prepare(
      `UPDATE budgets SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        max_amount = COALESCE(?, max_amount),
        color = COALESCE(?, color),
        period = COALESCE(?, period),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`
    )
    .run(
      categoryId,
      name,
      maxAmount,
      color,
      period,
      startDate,
      endDate,
      id,
      userId
    );
}

export function deleteBudget(id, userId) {
  const database = getDb();
  return database
    .prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?")
    .run(id, userId);
}

// ============================================
// POT (SAVINGS) QUERIES
// ============================================
export function getPots(userId) {
  const database = getDb();
  return database
    .prepare(`SELECT * FROM pots WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId);
}

export function getPotById(id, userId) {
  const database = getDb();
  return database
    .prepare("SELECT * FROM pots WHERE id = ? AND user_id = ?")
    .get(id, userId);
}

export function createPot(userId, data) {
  const database = getDb();
  const { name, description, targetAmount, color, icon, deadline } = data;

  const result = database
    .prepare(
      `INSERT INTO pots 
        (user_id, name, description, target_amount, color, icon, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId,
      name,
      description || null,
      targetAmount,
      color || "#3B82F6",
      icon || "piggy-bank",
      deadline || null
    );

  return result.lastInsertRowid;
}

export function updatePot(id, userId, data) {
  const database = getDb();
  const {
    name,
    description,
    targetAmount,
    savedAmount,
    color,
    icon,
    deadline,
  } = data;

  return database
    .prepare(
      `UPDATE pots SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        target_amount = COALESCE(?, target_amount),
        saved_amount = COALESCE(?, saved_amount),
        color = COALESCE(?, color),
        icon = COALESCE(?, icon),
        deadline = COALESCE(?, deadline),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?`
    )
    .run(
      name,
      description,
      targetAmount,
      savedAmount,
      color,
      icon,
      deadline,
      id,
      userId
    );
}

export function deletePot(id, userId) {
  const database = getDb();
  return database
    .prepare("DELETE FROM pots WHERE id = ? AND user_id = ?")
    .run(id, userId);
}

export function addToPot(potId, userId, amount, note = null) {
  const database = getDb();

  // Start a transaction
  const addTransaction = database.transaction(() => {
    // Add pot transaction record
    database
      .prepare(
        `INSERT INTO pot_transactions (pot_id, user_id, amount, type, note)
         VALUES (?, ?, ?, 'deposit', ?)`
      )
      .run(potId, userId, amount, note);

    // Update pot saved amount
    database
      .prepare(
        `UPDATE pots SET 
          saved_amount = saved_amount + ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?`
      )
      .run(amount, potId, userId);
  });

  addTransaction();
  return getPotById(potId, userId);
}

export function withdrawFromPot(potId, userId, amount, note = null) {
  const database = getDb();

  // Start a transaction
  const withdrawTransaction = database.transaction(() => {
    // Check if pot has enough balance
    const pot = database
      .prepare("SELECT saved_amount FROM pots WHERE id = ? AND user_id = ?")
      .get(potId, userId);

    if (!pot || pot.saved_amount < amount) {
      throw new Error("Insufficient balance in pot");
    }

    // Add pot transaction record
    database
      .prepare(
        `INSERT INTO pot_transactions (pot_id, user_id, amount, type, note)
         VALUES (?, ?, ?, 'withdrawal', ?)`
      )
      .run(potId, userId, amount, note);

    // Update pot saved amount
    database
      .prepare(
        `UPDATE pots SET 
          saved_amount = saved_amount - ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?`
      )
      .run(amount, potId, userId);
  });

  withdrawTransaction();
  return getPotById(potId, userId);
}

export function getPotTransactions(potId, userId) {
  const database = getDb();
  return database
    .prepare(
      `SELECT * FROM pot_transactions 
       WHERE pot_id = ? AND user_id = ?
       ORDER BY created_at DESC`
    )
    .all(potId, userId);
}

// ============================================
// DASHBOARD/SUMMARY QUERIES
// ============================================
// Add this to lib/db.js - update the getDashboardSummary function

export function getDashboardSummary(userId) {
  const database = getDb();

  // Get current month stats
  const currentMonth = database
    .prepare(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM transactions
      WHERE user_id = ? 
        AND date >= date('now', 'start of month')
        AND date <= date('now', 'start of month', '+1 month', '-1 day')`
    )
    .get(userId);

  // Get all-time balance (income - expenses based on type column)
  const allTimeBalance = database
    .prepare(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
      FROM transactions
      WHERE user_id = ?`
    )
    .get(userId);

  // Get total savings from pots
  const totalSavings = database
    .prepare(
      `SELECT COALESCE(SUM(saved_amount), 0) as total FROM pots WHERE user_id = ?`
    )
    .get(userId);

  // Get recent transactions (last 5)
  const recentTransactions = database
    .prepare(
      `SELECT 
        t.id,
        t.name,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.recurring,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT 5`
    )
    .all(userId);

  // Get budget overview with spending
  const budgetOverview = database
    .prepare(
      `SELECT 
        b.id,
        b.name,
        b.max_amount,
        b.color,
        c.name as category_name,
        c.icon as category_icon,
        COALESCE(
          (SELECT SUM(t.amount) 
           FROM transactions t 
           WHERE t.user_id = b.user_id 
             AND t.category_id = b.category_id 
             AND t.type = 'expense'
             AND t.date >= date('now', 'start of month')
             AND t.date <= date('now', 'start of month', '+1 month', '-1 day')
          ), 0
        ) as spent
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT 4`
    )
    .all(userId);

  // Get pots overview (first 4)
  const potsOverview = database
    .prepare(
      `SELECT id, name, saved_amount, target_amount, color
       FROM pots WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 4`
    )
    .all(userId);

  // Get recurring bills (transactions marked as recurring)
  const recurringBills = database
    .prepare(
      `SELECT 
        t.id,
        t.name,
        t.amount,
        t.recurring_interval,
        t.date as last_date,
        c.name as category_name,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ? 
        AND t.recurring = 1
        AND t.type = 'expense'
      ORDER BY t.amount DESC
      LIMIT 5`
    )
    .all(userId);

  // Calculate recurring bills summary
  const paidBills = database
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = ? 
         AND recurring = 1
         AND type = 'expense'
         AND date >= date('now', 'start of month')`
    )
    .get(userId);

  const upcomingBills = database
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM transactions
       WHERE user_id = ? 
         AND recurring = 1
         AND type = 'expense'
         AND date < date('now', 'start of month')`
    )
    .get(userId);

  return {
    currentBalance: allTimeBalance.balance + totalSavings.total,
    currentMonth: {
      income: currentMonth.income,
      expenses: currentMonth.expenses,
      balance: currentMonth.income - currentMonth.expenses,
    },
    totalSavings: totalSavings.total,
    recentTransactions,
    budgetOverview,
    potsOverview,
    recurringBills,
    billsSummary: {
      paid: paidBills.total,
      upcoming: upcomingBills.total,
      dueSoon: 0,
    },
  };
}

// ==================== RECURRING BILLS FUNCTIONS ====================
export function getRecurringBills(userId, options = {}) {
  const database = getDb();

  let query = `
    SELECT 
      t.id,
      t.name,
      t.description,
      t.amount,
      t.type,
      t.date,
      t.recurring_interval,
      t.created_at,
      c.name as category,
      c.icon as category_icon,
      c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? 
      AND t.recurring = 1
      AND t.type = 'expense'
  `;

  const params = [userId];

  if (options.search) {
    query += " AND (t.name LIKE ? OR t.description LIKE ? OR c.name LIKE ?)";
    params.push(
      `%${options.search}%`,
      `%${options.search}%`,
      `%${options.search}%`
    );
  }

  query += " ORDER BY t.date DESC, t.amount DESC";

  const bills = database.prepare(query).all(...params);

  // Transform data to match frontend expectations
  return bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    description: bill.description,
    amount: Math.abs(bill.amount),
    date: bill.date,
    category: bill.category || "Bills",
    category_icon: bill.category_icon || "default",
    category_color: bill.category_color || "#6B7280",
    recurring_interval: bill.recurring_interval || "monthly", // Include this!
  }));
}
// Add these helper functions

export function getUserByProviderAccount(provider, providerAccountId) {
  const database = getDb();
  return database
    .prepare(
      `SELECT u.* FROM users u
       JOIN accounts a ON u.id = a.user_id
       WHERE a.provider = ? AND a.provider_account_id = ?`
    )
    .get(provider, providerAccountId);
}

export function createOAuthUser(
  email,
  name,
  avatar,
  provider,
  providerAccountId
) {
  const database = getDb();

  // Split name into first and last name
  const nameParts = (name || "").trim().split(" ");
  const firstName = nameParts[0] || email.split("@")[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  // Check if user with this email already exists
  const existingUser = database
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  let userId;

  if (existingUser) {
    userId = existingUser.id;

    // Update avatar and last_name if not set
    if (!existingUser.avatar && avatar) {
      database
        .prepare("UPDATE users SET avatar = ? WHERE id = ?")
        .run(avatar, userId);
    }
    if (!existingUser.last_name && lastName) {
      database
        .prepare("UPDATE users SET last_name = ? WHERE id = ?")
        .run(lastName, userId);
    }
  } else {
    // Create new user with first and last name
    const result = database
      .prepare(
        "INSERT INTO users (email, name, last_name, avatar, provider) VALUES (?, ?, ?, ?, ?)"
      )
      .run(email, firstName, lastName, avatar, provider);
    userId = result.lastInsertRowid;
  }

  // Check if account already linked
  const existingAccount = database
    .prepare(
      "SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?"
    )
    .get(provider, providerAccountId);

  if (!existingAccount) {
    // Link account
    database
      .prepare(
        `INSERT INTO accounts (user_id, type, provider, provider_account_id)
         VALUES (?, 'oauth', ?, ?)`
      )
      .run(userId, provider, providerAccountId);
  }

  return database.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

// ==================== OTP FUNCTIONS ====================

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new OTP for email verification
 */
export function createOTP(email) {
  const database = getDb();
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute from now

  // Delete any existing unused OTPs for this email
  database
    .prepare("DELETE FROM otp_codes WHERE email = ? AND used = 0")
    .run(email);

  // Insert new OTP
  database
    .prepare("INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)")
    .run(email, code, expiresAt.toISOString());

  return code;
}

/**
 * Verify OTP code
 */
export function verifyOTP(email, code) {
  const database = getDb();

  const otp = database
    .prepare(
      `SELECT * FROM otp_codes 
       WHERE email = ? 
         AND code = ? 
         AND used = 0 
         AND expires_at > datetime('now')
       ORDER BY created_at DESC 
       LIMIT 1`
    )
    .get(email, code);

  if (!otp) {
    return { valid: false, reason: "Invalid or expired OTP" };
  }

  // Mark OTP as used
  database.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?").run(otp.id);

  return { valid: true };
}

/**
 * Check OTP rate limit
 * Returns: { allowed: boolean, remainingAttempts: number, waitTime: number (in seconds) }
 */
export function checkOTPRateLimit(email) {
  const database = getDb();
  const MAX_REQUESTS = 3;
  const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
  const REQUEST_WINDOW = 60 * 60 * 1000; // 1 hour window for counting requests
  const MIN_INTERVAL = 60 * 1000; // 1 minute between requests

  const now = new Date();

  let rateLimit = database
    .prepare("SELECT * FROM otp_rate_limits WHERE email = ?")
    .get(email);

  // If no record exists, create one
  if (!rateLimit) {
    database
      .prepare(
        `INSERT INTO otp_rate_limits (email, request_count, first_request_at, last_request_at)
         VALUES (?, 0, NULL, NULL)`
      )
      .run(email);

    return { allowed: true, remainingAttempts: MAX_REQUESTS, waitTime: 0 };
  }

  // Check if user is blocked
  if (rateLimit.blocked_until) {
    const blockedUntil = new Date(rateLimit.blocked_until);
    if (now < blockedUntil) {
      const waitTime = Math.ceil((blockedUntil - now) / 1000);
      return { allowed: false, remainingAttempts: 0, waitTime, blocked: true };
    } else {
      // Block period is over, reset
      database
        .prepare(
          `UPDATE otp_rate_limits 
           SET request_count = 0, first_request_at = NULL, last_request_at = NULL, blocked_until = NULL
           WHERE email = ?`
        )
        .run(email);
      rateLimit.request_count = 0;
      rateLimit.blocked_until = null;
      rateLimit.first_request_at = null;
      rateLimit.last_request_at = null;
    }
  }

  // Check minimum interval between requests (1 minute)
  if (rateLimit.last_request_at) {
    const lastRequest = new Date(rateLimit.last_request_at);
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < MIN_INTERVAL) {
      const waitTime = Math.ceil((MIN_INTERVAL - timeSinceLastRequest) / 1000);
      return {
        allowed: false,
        remainingAttempts: MAX_REQUESTS - rateLimit.request_count,
        waitTime,
        blocked: false,
      };
    }
  }

  // Check if we need to reset the window
  if (rateLimit.first_request_at) {
    const firstRequest = new Date(rateLimit.first_request_at);
    const timeSinceFirstRequest = now - firstRequest;

    if (timeSinceFirstRequest > REQUEST_WINDOW) {
      // Reset the counter
      database
        .prepare(
          `UPDATE otp_rate_limits 
           SET request_count = 0, first_request_at = NULL, last_request_at = NULL
           WHERE email = ?`
        )
        .run(email);
      rateLimit.request_count = 0;
    }
  }

  // Check if max requests reached
  if (rateLimit.request_count >= MAX_REQUESTS) {
    // Block the user for 1 hour
    const blockedUntil = new Date(now.getTime() + BLOCK_DURATION);
    database
      .prepare(`UPDATE otp_rate_limits SET blocked_until = ? WHERE email = ?`)
      .run(blockedUntil.toISOString(), email);

    const waitTime = Math.ceil(BLOCK_DURATION / 1000);
    return { allowed: false, remainingAttempts: 0, waitTime, blocked: true };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_REQUESTS - rateLimit.request_count,
    waitTime: 0,
  };
}

/**
 * Increment OTP request count
 */
export function incrementOTPRequestCount(email) {
  const database = getDb();
  const now = new Date().toISOString();

  const rateLimit = database
    .prepare("SELECT * FROM otp_rate_limits WHERE email = ?")
    .get(email);

  if (rateLimit) {
    const firstRequestAt = rateLimit.first_request_at || now;
    database
      .prepare(
        `UPDATE otp_rate_limits 
         SET request_count = request_count + 1, 
             first_request_at = COALESCE(first_request_at, ?),
             last_request_at = ?
         WHERE email = ?`
      )
      .run(firstRequestAt, now, email);
  } else {
    database
      .prepare(
        `INSERT INTO otp_rate_limits (email, request_count, first_request_at, last_request_at)
         VALUES (?, 1, ?, ?)`
      )
      .run(email, now, now);
  }
}

/**
 * Mark user email as verified
 */
export function markEmailVerified(userId) {
  const database = getDb();
  database
    .prepare("UPDATE users SET email_verified = 1 WHERE id = ?")
    .run(userId);
}

/**
 * Check if email is verified
 */
export function isEmailVerified(userId) {
  const database = getDb();
  const user = database
    .prepare("SELECT email_verified FROM users WHERE id = ?")
    .get(userId);
  return user?.email_verified === 1;
}

/**
 * Clean up expired OTPs (can be run periodically)
 */
export function cleanupExpiredOTPs() {
  const database = getDb();
  const result = database
    .prepare("DELETE FROM otp_codes WHERE expires_at < datetime('now')")
    .run();
  return result.changes;
}
