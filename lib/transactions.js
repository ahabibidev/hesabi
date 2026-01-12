// lib/transactions.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getTransactions, getCategories, getUserById } from "@/lib/db";

export async function getTransactionsData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const user = getUserById(session.user.id);
    const transactions = getTransactions(session.user.id, {});
    const categories = getCategories(session.user.id);

    // Transform transactions to match the expected format
    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      amount: t.type === "income" ? Math.abs(t.amount) : -Math.abs(t.amount),
      type: t.type === "income" ? "Income" : "Expense",
      category: t.category_name || "Other",
      category_icon: t.category_icon || "default",
      category_color: t.category_color || "#6B7280",
      date: t.date,
      recurring: t.recurring,
      recurring_interval: t.recurring_interval,
    }));

    return {
      user,
      transactions: formattedTransactions,
      categories,
    };
  } catch (error) {
    console.error("Error fetching transactions data:", error);
    return null;
  }
}
