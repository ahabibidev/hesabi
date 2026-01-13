// lib/budgets.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getBudgets,
  getTransactions,
  getCategories,
  getUserById,
} from "@/lib/db";

export async function getBudgetsData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const user = getUserById(session.user.id);
    const budgets = getBudgets(session.user.id);
    const transactions = getTransactions(session.user.id, {});
    const categories = getCategories(session.user.id);

    // Transform budgets to match the expected format
    const formattedBudgets = budgets.map((b) => ({
      id: b.id,
      name: b.name,
      max: b.max_amount,
      color: b.color || "#0d9488",
      spent: b.spent || 0,
      category_id: b.category_id,
      category_name: b.category_name,
      period: b.period || "monthly",
    }));

    // Transform transactions
    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      amount: t.type === "income" ? Math.abs(t.amount) : -Math.abs(t.amount),
      type: t.type === "income" ? "Income" : "Expense",
      category: t.category_name || "Other",
      category_id: t.category_id,
      category_icon: t.category_icon || "default",
      category_color: t.category_color || "#6B7280",
      date: t.date,
    }));

    return {
      user,
      budgets: formattedBudgets,
      transactions: formattedTransactions,
      categories,
    };
  } catch (error) {
    console.error("Error fetching budgets data:", error);
    return null;
  }
}
