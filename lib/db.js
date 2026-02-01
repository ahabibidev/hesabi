// lib/db.js
import { createClient } from "@libsql/client";

/**
 * Singleton database client instance.
 * @type {import("@libsql/client").Client | null}
 */
let client = null;

/**
 * Returns a singleton database client configured for Turso in production
 * and local SQLite in development.
 * @returns {import("@libsql/client").Client} Database client instance.
 */
export function getDb() {
  if (client) return client;

  if (process.env.TURSO_DATABASE_URL) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  } else {
    client = createClient({
      url: "file:./database.db",
    });
  }

  return client;
}

// ============================================
// QUERY HELPERS
// ============================================
/**
 * Execute a parameterized SQL statement.
 * @param {string} sql SQL query string.
 * @param {Array<unknown>} params Bound parameters.
 * @returns {Promise<import("@libsql/client").ResultSet>} Database response.
 */
async function query(sql, params = []) {
  const db = getDb();
  const result = await db.execute({ sql, args: params });
  return result;
}

/**
 * Execute a SQL query and return a single row.
 * @param {string} sql SQL query string.
 * @param {Array<unknown>} params Bound parameters.
 * @returns {Promise<Record<string, unknown> | null>} First row or null.
 */
async function queryOne(sql, params = []) {
  const result = await query(sql, params);
  return result.rows[0] || null;
}

/**
 * Execute a SQL query and return all rows.
 * @param {string} sql SQL query string.
 * @param {Array<unknown>} params Bound parameters.
 * @returns {Promise<Array<Record<string, unknown>>>} Rows returned.
 */
async function queryAll(sql, params = []) {
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Execute a write statement and return metadata.
 * @param {string} sql SQL statement.
 * @param {Array<unknown>} params Bound parameters.
 * @returns {{ lastInsertRowid: number, changes: number }} Mutation metadata.
 */
async function execute(sql, params = []) {
  const db = getDb();
  const result = await db.execute({ sql, args: params });
  return {
    lastInsertRowid: Number(result.lastInsertRowid),
    changes: result.rowsAffected,
  };
}

/**
 * Execute multiple SQL statements in a batch.
 * @param {string} sql Statements separated by semicolons.
 */
async function executeMultiple(sql) {
  const db = getDb();
  await db.executeMultiple(sql);
}

/**
 * Execute multiple SQL statements in a transaction.
 * @param {Array<import("@libsql/client").Statement>} statements - An array of SQL statements.
 * @returns {Promise<import("@libsql/client").ResultSet[]>} - An array of result sets.
 */
async function batch(statements) {
    const db = getDb();
    return await db.batch(statements);
}

// ============================================
// DATABASE INITIALIZATION
// ============================================
/**
 * Initialize database schema and seed default categories.
 * @returns {Promise<void>}
 */
export async function initializeDb() {
  await executeMultiple(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      name TEXT,
      last_name TEXT,
      avatar TEXT DEFAULT '/avatars/user.png',
      provider TEXT DEFAULT 'credentials',
      provider_id TEXT,
      email_verified INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      theme TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Accounts table (for OAuth)
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
      UNIQUE(provider, provider_account_id)
    );

    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'both')),
      icon TEXT DEFAULT 'default',
      color TEXT DEFAULT '#6B7280',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Transactions table
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      date DATE NOT NULL,
      recurring INTEGER DEFAULT 0,
      recurring_interval TEXT CHECK(recurring_interval IN ('daily', 'weekly', 'monthly', 'yearly')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Budgets table
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER,
      name TEXT NOT NULL,
      max_amount REAL NOT NULL,
      color TEXT DEFAULT '#0d9488',
      period TEXT DEFAULT 'monthly' CHECK(period IN ('weekly', 'monthly', 'yearly')),
      start_date DATE,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pots (Savings) table
    CREATE TABLE IF NOT EXISTS pots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      target_amount REAL NOT NULL,
      saved_amount REAL DEFAULT 0,
      color TEXT DEFAULT '#3B82F6',
      icon TEXT DEFAULT 'piggy-bank',
      deadline DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Pot transactions table
    CREATE TABLE IF NOT EXISTS pot_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pot_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('deposit', 'withdrawal')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- OTP codes table
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- OTP rate limits table
    CREATE TABLE IF NOT EXISTS otp_rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      request_count INTEGER DEFAULT 0,
      first_request_at DATETIME,
      last_request_at DATETIME,
      blocked_until DATETIME
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
    CREATE INDEX IF NOT EXISTS idx_pots_user_id ON pots(user_id);
    CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes(email);
    CREATE INDEX IF NOT EXISTS idx_rate_limit_email ON otp_rate_limits(email);
  `);

  // Insert default categories
  await insertDefaultCategories();
}

async function insertDefaultCategories() {
  const existing = await queryOne(
    "SELECT COUNT(*) as count FROM categories WHERE is_default = 1",
  );

  if (existing && existing.count > 0) return;

  const defaultCategories = [
    // Expense categories
    { name: "Entertainment", type: "expense", icon: "film", color: "#8B5CF6" },
    {
      name: "Groceries",
      type: "expense",
      icon: "shopping-cart",
      color: "#10B981",
    },
    { name: "Dining", type: "expense", icon: "utensils", color: "#F59E0B" },
    { name: "Transportation", type: "expense", icon: "car", color: "#3B82F6" },
    {
      name: "Shopping",
      type: "expense",
      icon: "shopping-bag",
      color: "#EC4899",
    },
    { name: "Bills", type: "expense", icon: "file-text", color: "#EF4444" },
    { name: "Personal Care", type: "expense", icon: "heart", color: "#F43F5E" },
    { name: "Healthcare", type: "expense", icon: "activity", color: "#06B6D4" },
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
    { name: "Other", type: "both", icon: "more-horizontal", color: "#6B7280" },
    {
      name: "Transfer",
      type: "both",
      icon: "arrow-right-left",
      color: "#64748B",
    },
  ];

  for (const category of defaultCategories) {
    await execute(
      "INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES (NULL, ?, ?, ?, ?, 1)",
      [category.name, category.type, category.icon, category.color],
    );
  }
}

// ============================================
// USER FUNCTIONS
// ============================================
/**
 * Retrieves a user by their email address.
 * @param {string} email - User's email address.
 * @returns {Promise<Object|null>} User object or null if not found.
 */
export async function getUserByEmail(email) {
  return await queryOne("SELECT * FROM users WHERE email = ?", [email]);
}

/**
 * Retrieves a user by their ID with formatted avatar and defaults.
 * @param {number} id - User's database ID.
 * @returns {Promise<Object|null>} User object with formatted fields or null.
 */
export async function getUserById(id) {
  return await queryOne(
    `SELECT 
      id, email, name, last_name,
      COALESCE(avatar, '/avatars/user.png') as avatar,
      COALESCE(currency, 'USD') as currency,
      COALESCE(theme, 'light') as theme,
      email_verified, provider, created_at
    FROM users WHERE id = ?`,
    [id],
  );
}

/**
 * Creates a new user account with credentials provider.
 * @param {string} email - User's email address.
 * @param {string} password - Hashed password.
 * @param {string} name - User's first name.
 * @param {string|null} lastName - User's last name.
 * @returns {Promise<number>} ID of the newly created user.
 */
export async function createUser(email, password, name, lastName) {
  const result = await execute(
    "INSERT INTO users (email, password, name, last_name, provider, email_verified) VALUES (?, ?, ?, ?, 'credentials', 0)",
    [email, password, name, lastName || null],
  );
  return result.lastInsertRowid;
}

/**
 * Updates user profile information.
 * @param {number} userId - User's database ID.
 * @param {Object} data - Profile data to update.
 * @param {string} [data.firstName] - New first name.
 * @param {string} [data.lastName] - New last name.
 * @param {string} [data.email] - New email address.
 * @param {string} [data.avatar] - New avatar path.
 * @param {string} [data.currency] - New currency preference.
 * @param {string} [data.theme] - New theme preference.
 * @returns {Promise<void>}
 */
export async function updateUserProfile(userId, data) {
  const { firstName, lastName, email, avatar, currency, theme } = data;

  await execute(
    `UPDATE users SET 
      name = COALESCE(?, name),
      last_name = COALESCE(?, last_name),
      email = COALESCE(?, email),
      avatar = COALESCE(?, avatar),
      currency = COALESCE(?, currency),
      theme = COALESCE(?, theme),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [firstName, lastName, email, avatar, currency, theme, userId],
  );
}

/**
 * Retrieves a user by OAuth provider account information.
 * @param {string} provider - OAuth provider (google/github).
 * @param {string} providerAccountId - Provider's account ID.
 * @returns {Promise<Object|null>} User object or null if not found.
 */
export async function getUserByProviderAccount(provider, providerAccountId) {
  return await queryOne(
    `SELECT u.* FROM users u
     JOIN accounts a ON u.id = a.user_id
     WHERE a.provider = ? AND a.provider_account_id = ?`,
    [provider, providerAccountId],
  );
}

/**
 * Creates or updates a user account via OAuth provider.
 * @param {string} email - User's email from OAuth provider.
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @param {string} avatar - Avatar URL from provider.
 * @param {string} provider - OAuth provider name.
 * @param {string} providerAccountId - Provider account ID.
 * @returns {Promise<Object>} Created or updated user object.
 */
export async function createOAuthUser(
  email,
  firstName,
  lastName,
  avatar,
  provider,
  providerAccountId,
) {
  // Check if user exists
  const existingUser = await queryOne("SELECT * FROM users WHERE email = ?", [
    email,
  ]);

  let userId;

  if (existingUser) {
    userId = existingUser.id;

    // Always update oauth_avatar to keep it current with provider's image
    if (avatar) {
      await execute("UPDATE users SET oauth_avatar = ? WHERE id = ?", [
        avatar,
        userId,
      ]);
    }

    // Update avatar only if not set (first time or if user hasn't customized)
    if (!existingUser.avatar && avatar) {
      await execute("UPDATE users SET avatar = ? WHERE id = ?", [
        avatar,
        userId,
      ]);
    }

    // Update last_name if not set
    if (!existingUser.last_name && lastName) {
      await execute("UPDATE users SET last_name = ? WHERE id = ?", [
        lastName,
        userId,
      ]);
    }

    // Mark as verified for OAuth users
    await execute("UPDATE users SET email_verified = 1 WHERE id = ?", [userId]);
  } else {
    // Create new user - set both avatar and oauth_avatar
    const result = await execute(
      "INSERT INTO users (email, name, last_name, avatar, oauth_avatar, provider, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [email, firstName, lastName || null, avatar, avatar, provider],
    );
    userId = result.lastInsertRowid;
  }

  // Check if account already linked
  const existingAccount = await queryOne(
    "SELECT * FROM accounts WHERE provider = ? AND provider_account_id = ?",
    [provider, providerAccountId],
  );

  if (!existingAccount) {
    await execute(
      "INSERT INTO accounts (user_id, type, provider, provider_account_id) VALUES (?, 'oauth', ?, ?)",
      [userId, provider, providerAccountId],
    );
  }

  return await queryOne("SELECT * FROM users WHERE id = ?", [userId]);
}

/**
 * Deletes a user and all their associated data from the database.
 * @param {number} userId - The ID of the user to delete.
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  const statements = [
    { sql: "DELETE FROM users WHERE id = ?", args: [userId] },
    { sql: "DELETE FROM accounts WHERE user_id = ?", args: [userId] },
    { sql: "DELETE FROM categories WHERE user_id = ?", args: [userId] },
    { sql: "DELETE FROM transactions WHERE user_id = ?", args: [userId] },
    { sql: "DELETE FROM budgets WHERE user_id = ?", args: [userId] },
    { sql: "DELETE FROM pots WHERE user_id = ?", args: [userId] },
    { sql: "DELETE FROM pot_transactions WHERE user_id = ?", args: [userId] },
  ];

  await batch(statements);
}

// ============================================
// CATEGORY FUNCTIONS
// ============================================
export async function getCategories(userId, type = null) {
  let sql = "SELECT * FROM categories WHERE (user_id = ? OR is_default = 1)";
  const params = [userId];

  if (type) {
    sql += " AND (type = ? OR type = 'both')";
    params.push(type);
  }

  sql += " ORDER BY is_default DESC, name ASC";

  return await queryAll(sql, params);
}

export async function createCategory(userId, name, type, icon, color) {
  const result = await execute(
    "INSERT INTO categories (user_id, name, type, icon, color) VALUES (?, ?, ?, ?, ?)",
    [userId, name, type, icon, color],
  );
  return result.lastInsertRowid;
}

// ============================================
// TRANSACTION FUNCTIONS
// ============================================
export async function getTransactions(userId, options = {}) {
  const { limit, offset, type, categoryId, startDate, endDate, search } =
    options;

  let sql = `
    SELECT 
      t.*,
      c.name as category,
      c.icon as category_icon,
      c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
  `;
  const params = [userId];

  if (type) {
    sql += " AND t.type = ?";
    params.push(type);
  }

  if (categoryId) {
    sql += " AND t.category_id = ?";
    params.push(categoryId);
  }

  if (startDate) {
    sql += " AND t.date >= ?";
    params.push(startDate);
  }

  if (endDate) {
    sql += " AND t.date <= ?";
    params.push(endDate);
  }

  if (search) {
    sql += " AND (t.name LIKE ? OR t.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += " ORDER BY t.date DESC, t.created_at DESC";

  if (limit) {
    sql += " LIMIT ?";
    params.push(limit);
  }

  if (offset) {
    sql += " OFFSET ?";
    params.push(offset);
  }

  return await queryAll(sql, params);
}

export async function getTransactionById(id, userId) {
  return await queryOne(
    `SELECT 
      t.*,
      c.name as category,
      c.icon as category_icon,
      c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = ? AND t.user_id = ?`,
    [id, userId],
  );
}

export async function createTransaction(userId, data) {
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

  const result = await execute(
    `INSERT INTO transactions 
      (user_id, category_id, name, description, amount, type, date, recurring, recurring_interval)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      categoryId || null,
      name,
      description || null,
      Math.abs(amount),
      type,
      date,
      recurring ? 1 : 0,
      recurringInterval || null,
    ],
  );

  return result.lastInsertRowid;
}

export async function updateTransaction(id, userId, data) {
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

  const result = await execute(
    `UPDATE transactions SET
      category_id = ?,
      name = ?,
      description = ?,
      amount = ?,
      type = ?,
      date = ?,
      recurring = ?,
      recurring_interval = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?`,
    [
      categoryId || null,
      name,
      description || null,
      Math.abs(amount),
      type,
      date,
      recurring ? 1 : 0,
      recurringInterval || null,
      id,
      userId,
    ],
  );

  return result.changes > 0;
}

export async function deleteTransaction(id, userId) {
  const result = await execute(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.changes > 0;
}

// ============================================
// BUDGET FUNCTIONS
// ============================================
export async function getBudgets(userId) {
  return await queryAll(
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
    ORDER BY b.created_at DESC`,
    [userId],
  );
}

export async function getBudgetById(id, userId) {
  return await queryOne(
    `SELECT 
      b.*,
      c.name as category_name,
      c.icon as category_icon
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.id = ? AND b.user_id = ?`,
    [id, userId],
  );
}

export async function createBudget(userId, data) {
  const { categoryId, name, maxAmount, color, period, startDate, endDate } =
    data;

  const result = await execute(
    `INSERT INTO budgets (
      user_id,
      category_id,
      name,
      max_amount,
      color,
      period,
      start_date,
      end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      categoryId || null,
      name,
      maxAmount,
      color || "#0d9488",
      period || "monthly",
      startDate || null,
      endDate || null,
    ],
  );

  return result.lastInsertRowid;
}

export async function updateBudget(id, userId, data) {
  const { categoryId, name, maxAmount, color, period, startDate, endDate } =
    data;

  // ✅ Build dynamic query - only update fields that are provided
  const updates = [];
  const params = [];

  if (categoryId !== undefined) {
    const category = await queryOne("SELECT name FROM categories WHERE id = ?", [categoryId]);
    if(category){
      updates.push("category_id = ?");
      params.push(categoryId);
      updates.push("name = ?");
      params.push(category.name);
    }
  } else if (name !== undefined) {
    updates.push("name = ?");
    params.push(name);
  }

  if (maxAmount !== undefined) {
    updates.push("max_amount = ?");
    params.push(maxAmount);
  }

  if (color !== undefined) {
    updates.push("color = ?");
    params.push(color);
  }

  if (period !== undefined) {
    updates.push("period = ?");
    params.push(period);
  }

  if (startDate !== undefined) {
    updates.push("start_date = ?");
    params.push(startDate);
  }

  if (endDate !== undefined) {
    updates.push("end_date = ?");
    params.push(endDate);
  }

  // Always update timestamp
  updates.push("updated_at = CURRENT_TIMESTAMP");

  // If nothing to update (only timestamp would change)
  if (updates.length === 1) {
    return false;
  }

  // Add WHERE clause params
  params.push(id, userId);

  const sql = `UPDATE budgets SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`;

  const result = await execute(sql, params);

  return result.changes > 0;
}

export async function deleteBudget(id, userId) {
  const result = await execute(
    "DELETE FROM budgets WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.changes > 0;
}

// ============================================
// POT FUNCTIONS
// ============================================
export async function getPots(userId) {
  return await queryAll(
    "SELECT * FROM pots WHERE user_id = ? ORDER BY created_at DESC",
    [userId],
  );
}

export async function getPotById(id, userId) {
  return await queryOne("SELECT * FROM pots WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
}

export async function createPot(userId, data) {
  const { name, description, targetAmount, color, icon, deadline } = data;

  const result = await execute(
    "INSERT INTO pots (user_id, name, description, target_amount, color, icon, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      userId,
      name,
      description || null,
      targetAmount,
      color || "#3B82F6",
      icon || "piggy-bank",
      deadline || null,
    ],
  );

  return result.lastInsertRowid;
}

export async function updatePot(id, userId, data) {
  const {
    name,
    description,
    targetAmount,
    savedAmount,
    color,
    icon,
    deadline,
  } = data;

  // Convert undefined to null for Turso compatibility
  const safeParams = [
    name !== undefined ? name : null,
    description !== undefined ? description : null,
    targetAmount !== undefined ? targetAmount : null,
    savedAmount !== undefined ? savedAmount : null,
    color !== undefined ? color : null,
    icon !== undefined ? icon : null,
    deadline !== undefined ? deadline : null,
    id,
    userId,
  ];

  const result = await execute(
    `UPDATE pots SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      target_amount = COALESCE(?, target_amount),
      saved_amount = COALESCE(?, saved_amount),
      color = COALESCE(?, color),
      icon = COALESCE(?, icon),
      deadline = COALESCE(?, deadline),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?`,
    safeParams,
  );

  return result.changes > 0;
}

export async function deletePot(id, userId) {
  const result = await execute(
    "DELETE FROM pots WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return result.changes > 0;
}

export async function addToPot(potId, userId, amount, note = null) {
  const db = getDb();
  await db.batch([
    {
      sql: "INSERT INTO pot_transactions (pot_id, user_id, amount, type, note) VALUES (?, ?, ?, 'deposit', ?)",
      args: [potId, userId, amount, note],
    },
    {
      sql: "UPDATE pots SET saved_amount = saved_amount + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      args: [amount, potId, userId],
    },
  ]);

  return await getPotById(potId, userId);
}

export async function withdrawFromPot(potId, userId, amount, note = null) {
  const db = getDb();
  const pot = await getPotById(potId, userId);
  if (!pot || pot.saved_amount < amount) {
    throw new Error("Insufficient balance in pot");
  }

  await db.batch([
    {
      sql: "INSERT INTO pot_transactions (pot_id, user_id, amount, type, note) VALUES (?, ?, ?, 'withdrawal', ?)",
      args: [potId, userId, amount, note],
    },
    {
      sql: "UPDATE pots SET saved_amount = saved_amount - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
      args: [amount, potId, userId],
    },
  ]);

  return await getPotById(potId, userId);
}

export async function getPotTransactions(potId, userId) {
  return await queryAll(
    "SELECT * FROM pot_transactions WHERE pot_id = ? AND user_id = ? ORDER BY created_at DESC",
    [potId, userId],
  );
}

// ============================================
// RECURRING BILLS FUNCTIONS
// ============================================
export async function getRecurringBills(userId, options = {}) {
  let sql = `
    SELECT 
      t.id, t.name, t.description, t.amount, t.type, t.date, t.recurring_interval, t.created_at,
      c.name as category, c.icon as category_icon, c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.recurring = 1 AND t.type = 'expense'
  `;
  const params = [userId];

  if (options.search) {
    sql += " AND (t.name LIKE ? OR t.description LIKE ? OR c.name LIKE ?)";
    params.push(
      `%${options.search}%`,
      `%${options.search}%`,
      `%${options.search}%`,
    );
  }

  sql += " ORDER BY t.date DESC, t.amount DESC";

  const bills = await queryAll(sql, params);

  return bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    description: bill.description,
    amount: Math.abs(bill.amount),
    date: bill.date,
    category: bill.category || "Bills",
    category_icon: bill.category_icon || "default",
    category_color: bill.category_color || "#6B7280",
    recurring_interval: bill.recurring_interval || "monthly",
  }));
}

// ============================================
// DASHBOARD SUMMARY
// ============================================
export async function getDashboardSummary(userId) {
  // Current month stats
  const currentMonth = await queryOne(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
    FROM transactions
    WHERE user_id = ? 
      AND date >= date('now', 'start of month')
      AND date <= date('now', 'start of month', '+1 month', '-1 day')`,
    [userId],
  );

  // All-time balance
  const allTimeBalance = await queryOne(
    `SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as balance
    FROM transactions WHERE user_id = ?`,
    [userId],
  );

  // Total savings from pots
  const totalSavings = await queryOne(
    "SELECT COALESCE(SUM(saved_amount), 0) as total FROM pots WHERE user_id = ?",
    [userId],
  );

  // Recent transactions
  const recentTransactions = await queryAll(
    `SELECT 
      t.id, t.name, t.description, t.amount, t.type, t.date, t.recurring,
      c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC, t.created_at DESC
    LIMIT 5`,
    [userId],
  );

  // Budget overview
  const budgetOverview = await queryAll(
    `SELECT 
      b.id, b.name, b.max_amount, b.color,
      c.name as category_name, c.icon as category_icon,
      COALESCE(
        (SELECT SUM(t.amount) 
         FROM transactions t 
         WHERE t.user_id = b.user_id 
           AND t.category_id = b.category_id 
           AND t.type = 'expense'
           AND t.date >= date('now', 'start of month')
        ), 0
      ) as spent
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
    LIMIT 4`,
    [userId],
  );

  // Pots overview
  const potsOverview = await queryAll(
    "SELECT id, name, saved_amount, target_amount, color FROM pots WHERE user_id = ? ORDER BY created_at DESC LIMIT 4",
    [userId],
  );

  // Recurring bills
  const recurringBills = await queryAll(
    `SELECT 
      t.id, t.name, t.amount, t.recurring_interval, t.date as last_date,
      c.name as category_name, c.color as category_color
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.recurring = 1 AND t.type = 'expense'
    ORDER BY t.amount DESC
    LIMIT 5`,
    [userId],
  );

  // Bills summary
  const paidBills = await queryOne(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = ? AND recurring = 1 AND type = 'expense' AND date >= date('now', 'start of month')`,
    [userId],
  );

  const upcomingBills = await queryOne(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions
     WHERE user_id = ? AND recurring = 1 AND type = 'expense' AND date < date('now', 'start of month')`,
    [userId],
  );

  return {
    currentBalance: (allTimeBalance?.balance || 0) + (totalSavings?.total || 0),
    currentMonth: {
      income: currentMonth?.income || 0,
      expenses: currentMonth?.expenses || 0,
      balance: (currentMonth?.income || 0) - (currentMonth?.expenses || 0),
    },
    totalSavings: totalSavings?.total || 0,
    recentTransactions,
    budgetOverview,
    potsOverview,
    recurringBills,
  };
}

// ============================================
// OTP FUNCTIONS (Fixed for Turso)
// ============================================

const OTP_EXPIRY_MINUTES = 10; // OTP valid for 10 minutes
const MAX_OTP_REQUESTS = 5; // Maximum 5 OTP requests (updated from 3)
const BLOCK_DURATION_SECONDS = 60 * 60; // 1 hour block
const MIN_INTERVAL_SECONDS = 60; // 1 minute between requests

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTP(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const code = generateOTP();

  // Store expiry as Unix timestamp (milliseconds) for reliable comparison
  const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

  // Delete existing unused OTPs for this email
  await execute("DELETE FROM otp_codes WHERE email = ? AND used = 0", [
    normalizedEmail,
  ]);

  // Insert new OTP with Unix timestamp
  await execute(
    "INSERT INTO otp_codes (email, code, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)",
    [normalizedEmail, code, expiresAt, Date.now()],
  );

  return code;
}

export async function verifyOTP(email, code) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = code.trim();

  // Fetch OTP without time comparison in SQL (we'll do it in JS)
  const otp = await queryOne(
    `SELECT * FROM otp_codes 
     WHERE email = ? AND code = ? AND used = 0
     ORDER BY created_at DESC 
     LIMIT 1`,
    [normalizedEmail, normalizedCode],
  );

  if (!otp) {
    // Check if there's any OTP for this email (to give better error message)
    const anyOtp = await queryOne(
      "SELECT * FROM otp_codes WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1",
      [normalizedEmail],
    );

    if (anyOtp) {
      return {
        valid: false,
        reason: "Invalid OTP code. Please check and try again.",
      };
    }

    return { valid: false, reason: "No OTP found. Please request a new code." };
  }

  // Check expiry in JavaScript (reliable across all DBs)
  const now = Date.now();
  const expiresAt = Number(otp.expires_at);

  if (now > expiresAt) {
    // Mark as used since it's expired
    await execute("UPDATE otp_codes SET used = 1 WHERE id = ?", [otp.id]);
    return {
      valid: false,
      reason: "OTP has expired. Please request a new code.",
    };
  }

  // OTP is valid - mark as used
  await execute("UPDATE otp_codes SET used = 1 WHERE id = ?", [otp.id]);
  return { valid: true };
}

export async function checkOTPRateLimit(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  let rateLimit = await queryOne(
    "SELECT * FROM otp_rate_limits WHERE email = ?",
    [normalizedEmail],
  );

  if (!rateLimit) {
    await execute(
      "INSERT INTO otp_rate_limits (email, request_count, created_at) VALUES (?, 0, ?)",
      [normalizedEmail, now],
    );
    return { allowed: true, remainingAttempts: MAX_OTP_REQUESTS, waitTime: 0 };
  }

  // Check if blocked
  if (rateLimit.blocked_until) {
    const blockedUntil = Number(rateLimit.blocked_until);
    if (now < blockedUntil) {
      const waitTime = Math.ceil((blockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        waitTime,
        blocked: true,
      };
    } else {
      // Block period expired, reset
      await execute(
        `UPDATE otp_rate_limits 
         SET request_count = 0, first_request_at = NULL, last_request_at = NULL, blocked_until = NULL 
         WHERE email = ?`,
        [normalizedEmail],
      );
      rateLimit.request_count = 0;
    }
  }

  // Check minimum interval between requests
  if (rateLimit.last_request_at) {
    const lastRequest = Number(rateLimit.last_request_at);
    const timeSince = now - lastRequest;
    if (timeSince < MIN_INTERVAL_SECONDS * 1000) {
      const waitTime = Math.ceil(
        (MIN_INTERVAL_SECONDS * 1000 - timeSince) / 1000,
      );
      return {
        allowed: false,
        remainingAttempts: MAX_OTP_REQUESTS - rateLimit.request_count,
        waitTime,
        blocked: false,
      };
    }
  }

  // Check max requests
  if (rateLimit.request_count >= MAX_OTP_REQUESTS) {
    const blockedUntil = now + BLOCK_DURATION_SECONDS * 1000;
    await execute(
      "UPDATE otp_rate_limits SET blocked_until = ? WHERE email = ?",
      [blockedUntil, normalizedEmail],
    );
    return {
      allowed: false,
      remainingAttempts: 0,
      waitTime: BLOCK_DURATION_SECONDS,
      blocked: true,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_OTP_REQUESTS - rateLimit.request_count,
    waitTime: 0,
  };
}

export async function incrementOTPRequestCount(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  // Check if record exists
  const existing = await queryOne(
    "SELECT * FROM otp_rate_limits WHERE email = ?",
    [normalizedEmail],
  );

  if (!existing) {
    await execute(
      "INSERT INTO otp_rate_limits (email, request_count, first_request_at, last_request_at) VALUES (?, 1, ?, ?)",
      [normalizedEmail, now, now],
    );
  } else {
    await execute(
      `UPDATE otp_rate_limits 
       SET request_count = request_count + 1, 
           first_request_at = COALESCE(first_request_at, ?),
           last_request_at = ?
       WHERE email = ?`,
      [now, now, normalizedEmail],
    );
  }
}

export async function markEmailVerified(userId) {
  await execute("UPDATE users SET email_verified = 1 WHERE id = ?", [userId]);
}

export async function isEmailVerified(userId) {
  const user = await queryOne("SELECT email_verified FROM users WHERE id = ?", [
    userId,
  ]);
  return user?.email_verified === 1;
}

export async function cleanupExpiredOTPs() {
  const now = Date.now();
  const result = await execute("DELETE FROM otp_codes WHERE expires_at < ?", [
    now,
  ]);
  return result.changes;
}

export async function checkOTPValidity(email, code) {
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedCode = code.trim();

  // Fetch OTP
  const otp = await queryOne(
    `SELECT * FROM otp_codes 
     WHERE email = ? AND code = ? AND used = 0
     ORDER BY created_at DESC 
     LIMIT 1`,
    [normalizedEmail, normalizedCode],
  );

  if (!otp) {
    // Check if there's any OTP for this email
    const anyOtp = await queryOne(
      "SELECT * FROM otp_codes WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1",
      [normalizedEmail],
    );

    if (anyOtp) {
      return {
        valid: false,
        reason: "Invalid OTP code. Please check and try again.",
      };
    }

    return { valid: false, reason: "No OTP found. Please request a new code." };
  }

  // Check expiry in JavaScript
  const now = Date.now();
  const expiresAt = Number(otp.expires_at);

  if (now > expiresAt) {
    return {
      valid: false,
      reason: "OTP has expired. Please request a new code.",
    };
  }

  // ✅ OTP is valid - DON'T mark as used yet
  return { valid: true };
}

export {
  getUserById,
  createOTP,
  checkOTPRateLimit,
  incrementOTPRequestCount,
  query,
  checkOTPValidity,
  queryOne,
  queryAll,
  execute,
  batch,
  deleteUser,
};
