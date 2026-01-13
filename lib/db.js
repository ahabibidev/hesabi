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
        id, email, name, 
        COALESCE(avatar, '/avatars/user.png') as avatar,
        COALESCE(currency, 'USD') as currency,
        COALESCE(theme, 'light') as theme,
        created_at 
      FROM users WHERE id = ?`
    )
    .get(id);
}

export function createUser(email, password, name) {
  const database = getDb();
  const result = database
    .prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)")
    .run(email, password, name);
  return result.lastInsertRowid;
}

export function updateUserProfile(userId, data) {
  const database = getDb();
  const { name, email, avatar, currency, theme } = data;

  return database
    .prepare(
      `UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        avatar = COALESCE(?, avatar),
        currency = COALESCE(?, currency),
        theme = COALESCE(?, theme),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    )
    .run(name, email, avatar, currency, theme, userId);
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

  // Get all-time balance (total income - total expenses)
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
      dueSoon: 0, // Can be calculated based on date logic
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
