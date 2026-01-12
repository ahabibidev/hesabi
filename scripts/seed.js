// scripts/seed-db.js
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function seedDatabase() {
  const dbPath = path.join(__dirname, "../database.db");
  const db = new Database(dbPath);

  console.log("🌱 Seeding database...\n");

  try {
    // Get the first user (or create one for testing)
    let user = db.prepare("SELECT id FROM users LIMIT 1").get();

    if (!user) {
      console.log("No users found. Please register a user first.");
      return;
    }

    const userId = user.id;
    console.log(`Using user ID: ${userId}\n`);

    // Get category IDs
    const getCategory = (name) =>
      db
        .prepare("SELECT id FROM categories WHERE name = ? AND is_default = 1")
        .get(name);

    const salaryCategory = getCategory("Salary");
    const groceriesCategory = getCategory("Groceries");
    const entertainmentCategory = getCategory("Entertainment");
    const billsCategory = getCategory("Bills");
    const diningCategory = getCategory("Dining");
    const transportationCategory = getCategory("Transportation");
    const shoppingCategory = getCategory("Shopping");
    const freelanceCategory = getCategory("Freelance");

    // Check if data already exists
    const existingTransactions = db
      .prepare("SELECT COUNT(*) as count FROM transactions WHERE user_id = ?")
      .get(userId);

    if (existingTransactions.count > 0) {
      console.log("Data already exists. Skipping seed.");
      return;
    }

    // Seed Transactions
    console.log("📝 Adding transactions...");
    const transactions = [
      {
        categoryId: salaryCategory?.id,
        name: "Monthly Salary",
        description: "Regular monthly salary",
        amount: 5000,
        type: "income",
        date: "2025-01-01",
        recurring: 1,
        recurringInterval: "monthly",
      },
      {
        categoryId: freelanceCategory?.id,
        name: "Freelance Project",
        description: "Web development project",
        amount: 1500,
        type: "income",
        date: "2025-01-15",
        recurring: 0,
        recurringInterval: null,
      },
      {
        categoryId: groceriesCategory?.id,
        name: "Weekly Groceries",
        description: "Supermarket shopping",
        amount: 150,
        type: "expense",
        date: "2025-01-10",
        recurring: 1,
        recurringInterval: "weekly",
      },
      {
        categoryId: entertainmentCategory?.id,
        name: "Netflix Subscription",
        description: "Monthly streaming",
        amount: 15.99,
        type: "expense",
        date: "2025-01-05",
        recurring: 1,
        recurringInterval: "monthly",
      },
      {
        categoryId: billsCategory?.id,
        name: "Electricity Bill",
        description: "Monthly electricity",
        amount: 120,
        type: "expense",
        date: "2025-01-08",
        recurring: 1,
        recurringInterval: "monthly",
      },
      {
        categoryId: diningCategory?.id,
        name: "Restaurant Dinner",
        description: "Dinner with friends",
        amount: 75,
        type: "expense",
        date: "2025-01-12",
        recurring: 0,
        recurringInterval: null,
      },
      {
        categoryId: transportationCategory?.id,
        name: "Gas",
        description: "Car fuel",
        amount: 60,
        type: "expense",
        date: "2025-01-14",
        recurring: 0,
        recurringInterval: null,
      },
      {
        categoryId: shoppingCategory?.id,
        name: "New Shoes",
        description: "Running shoes",
        amount: 120,
        type: "expense",
        date: "2025-01-16",
        recurring: 0,
        recurringInterval: null,
      },
    ];

    const insertTransaction = db.prepare(`
      INSERT INTO transactions (user_id, category_id, name, description, amount, type, date, recurring, recurring_interval)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of transactions) {
      insertTransaction.run(
        userId,
        t.categoryId,
        t.name,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.recurring,
        t.recurringInterval
      );
    }
    console.log(`   ✓ Added ${transactions.length} transactions`);

    // Seed Budgets
    console.log("\n💰 Adding budgets...");
    const budgets = [
      {
        categoryId: groceriesCategory?.id,
        name: "Groceries",
        maxAmount: 600,
        color: "#10B981",
        period: "monthly",
      },
      {
        categoryId: entertainmentCategory?.id,
        name: "Entertainment",
        maxAmount: 200,
        color: "#8B5CF6",
        period: "monthly",
      },
      {
        categoryId: diningCategory?.id,
        name: "Dining Out",
        maxAmount: 300,
        color: "#F59E0B",
        period: "monthly",
      },
      {
        categoryId: billsCategory?.id,
        name: "Bills",
        maxAmount: 500,
        color: "#EF4444",
        period: "monthly",
      },
    ];

    const insertBudget = db.prepare(`
      INSERT INTO budgets (user_id, category_id, name, max_amount, color, period)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const b of budgets) {
      insertBudget.run(
        userId,
        b.categoryId,
        b.name,
        b.maxAmount,
        b.color,
        b.period
      );
    }
    console.log(`   ✓ Added ${budgets.length} budgets`);

    // Seed Pots
    console.log("\n🐷 Adding savings pots...");
    const pots = [
      {
        name: "Emergency Fund",
        description: "For unexpected expenses",
        targetAmount: 10000,
        savedAmount: 3500,
        color: "#F59E0B",
        icon: "shield",
        deadline: "2025-12-31",
      },
      {
        name: "Vacation",
        description: "Hawaii trip fund",
        targetAmount: 5000,
        savedAmount: 1200,
        color: "#10B981",
        icon: "airplane",
        deadline: "2025-06-30",
      },
      {
        name: "New Laptop",
        description: "MacBook Pro",
        targetAmount: 2500,
        savedAmount: 750,
        color: "#3B82F6",
        icon: "laptop",
        deadline: "2025-03-31",
      },
      {
        name: "Car Down Payment",
        description: "Saving for a new car",
        targetAmount: 15000,
        savedAmount: 5000,
        color: "#8B5CF6",
        icon: "car",
        deadline: "2026-01-01",
      },
    ];

    const insertPot = db.prepare(`
      INSERT INTO pots (user_id, name, description, target_amount, saved_amount, color, icon, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const p of pots) {
      insertPot.run(
        userId,
        p.name,
        p.description,
        p.targetAmount,
        p.savedAmount,
        p.color,
        p.icon,
        p.deadline
      );
    }
    console.log(`   ✓ Added ${pots.length} savings pots`);

    console.log("\n✅ Database seeded successfully!");

    // Show summary
    const summary = {
      transactions: db
        .prepare("SELECT COUNT(*) as count FROM transactions WHERE user_id = ?")
        .get(userId).count,
      budgets: db
        .prepare("SELECT COUNT(*) as count FROM budgets WHERE user_id = ?")
        .get(userId).count,
      pots: db
        .prepare("SELECT COUNT(*) as count FROM pots WHERE user_id = ?")
        .get(userId).count,
    };

    console.log("\n📊 Summary:");
    console.log(`   Transactions: ${summary.transactions}`);
    console.log(`   Budgets: ${summary.budgets}`);
    console.log(`   Pots: ${summary.pots}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error(error);
  } finally {
    db.close();
  }
}

seedDatabase();
