// scripts/migrate-multi-currency.js
/**
 * Adds multi-currency support.
 *
 * Money columns keep their meaning, so every existing query keeps working:
 *
 *   transactions.amount        value in the user's MAIN currency
 *   transactions.original_*    what the user actually typed
 *   transactions.exchange_rate main-currency units per 1 original unit,
 *                              frozen at entry time so history never moves
 *
 *   pots.currency              the pot's own currency (NULL = main currency)
 *   pots.saved_amount          held in the POT's currency, never converted
 *
 * Existing rows are backfilled as "already in the main currency, rate 1",
 * which is exactly what they were before this migration.
 *
 * Runs against Turso when TURSO_DATABASE_URL is set, otherwise the local
 * database.db — the same resolution lib/db.js uses.
 */
import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const isTurso = Boolean(process.env.TURSO_DATABASE_URL);

const db = createClient(
  isTurso
    ? {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : { url: "file:" + resolve(__dirname, "../database.db") },
);

async function columnExists(table, column) {
  const result = await db.execute(`PRAGMA table_info(${table})`);
  return result.rows.some((row) => row.name === column);
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`   • ${table}.${column} already present, skipping`);
    return false;
  }

  await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`   ✓ ${table}.${column} added`);
  return true;
}

async function migrate() {
  console.log(
    `\n🚀 Multi-currency migration (${isTurso ? "Turso" : "local database.db"})\n`,
  );

  try {
    // ============================================
    // STEP 1: Transactions carry their own currency
    // ============================================
    console.log("📋 Step 1: transactions");
    await addColumn("transactions", "original_amount", "DECIMAL(10, 2)");
    await addColumn("transactions", "original_currency", "TEXT");
    await addColumn(
      "transactions",
      "exchange_rate",
      "DECIMAL(18, 8) DEFAULT 1",
    );

    // ============================================
    // STEP 2: Pots hold a single currency of their own
    // ============================================
    console.log("\n📋 Step 2: pots");
    await addColumn("pots", "currency", "TEXT");

    console.log("\n📋 Step 3: pot_transactions");
    await addColumn("pot_transactions", "original_amount", "DECIMAL(10, 2)");
    await addColumn("pot_transactions", "original_currency", "TEXT");
    await addColumn(
      "pot_transactions",
      "exchange_rate",
      "DECIMAL(18, 8) DEFAULT 1",
    );

    // ============================================
    // STEP 4: Per-user exchange rates
    // ============================================
    console.log("\n📋 Step 4: exchange_rates table");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        base_currency TEXT NOT NULL,
        quote_currency TEXT NOT NULL,
        rate DECIMAL(18, 8) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, base_currency, quote_currency),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("   ✓ exchange_rates ready");

    await db.execute(
      `CREATE INDEX IF NOT EXISTS idx_exchange_rates_user
       ON exchange_rates(user_id, base_currency)`,
    );
    console.log("   ✓ index ready");

    // ============================================
    // STEP 5: Backfill — existing rows are already in the main currency
    // ============================================
    console.log("\n📋 Step 5: backfilling existing rows");

    const txn = await db.execute(`
      UPDATE transactions
      SET original_amount = amount,
          original_currency = COALESCE(
            (SELECT currency FROM users WHERE users.id = transactions.user_id),
            'USD'
          ),
          exchange_rate = 1
      WHERE original_currency IS NULL
    `);
    console.log(`   ✓ ${txn.rowsAffected} transactions backfilled`);

    const potTxn = await db.execute(`
      UPDATE pot_transactions
      SET original_amount = amount,
          original_currency = COALESCE(
            (SELECT currency FROM users WHERE users.id = pot_transactions.user_id),
            'USD'
          ),
          exchange_rate = 1
      WHERE original_currency IS NULL
    `);
    console.log(`   ✓ ${potTxn.rowsAffected} pot transactions backfilled`);

    // Pots stay NULL on purpose: NULL means "same as my main currency", so a
    // later change of main currency does not strand them in a stale one.
    const pots = await db.execute(
      "SELECT COUNT(*) as count FROM pots WHERE currency IS NULL",
    );
    console.log(
      `   • ${pots.rows[0].count} pots left as NULL (= main currency)`,
    );

    // ============================================
    // Summary
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("📊 SUMMARY");
    console.log("=".repeat(50));

    for (const table of ["transactions", "pots", "pot_transactions", "exchange_rates"]) {
      const count = await db.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ${table.padEnd(20)} ${count.rows[0].count} rows`);
    }

    console.log("\n✅ Migration completed successfully\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
