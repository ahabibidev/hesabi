// lib/transactions.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getTransactions,
  getCategories,
  getUserById,
  getExchangeRates,
} from "@/lib/db";
import { buildRateMap } from "@/lib/currency";

export async function getTransactionsData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const user = await getUserById(session.user.id);
    const transactions = await getTransactions(session.user.id, {});
    const categories = await getCategories(session.user.id);

    if (!user || !transactions) {
      return null;
    }

    // Serialize to plain objects
    const plainTransactions = JSON.parse(JSON.stringify(transactions));
    const plainCategories = JSON.parse(JSON.stringify(categories));

    // Transform transactions to match the expected format
    const formattedTransactions = plainTransactions.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      amount: t.type === "income" ? Math.abs(t.amount) : -Math.abs(t.amount),
      type: t.type === "income" ? "Income" : "Expense",
      category: t.category || "Other", // ✅ FIXED - was t.category_name
      category_icon: t.category_icon || "default",
      category_color: t.category_color || "#6B7280",
      date: t.date,
      recurring: t.recurring,
      recurring_interval: t.recurring_interval,
      // What was actually typed, so editing reopens the entry as it was made
      // and rows can show the foreign figure next to the converted one.
      originalAmount: t.original_amount ?? Math.abs(t.amount),
      originalCurrency: t.original_currency || user.currency || "USD",
      exchangeRate: t.exchange_rate ?? 1,
    }));

    const mainCurrency = user?.currency || "USD";
    const rateMap = buildRateMap(
      await getExchangeRates(session.user.id, mainCurrency),
    );

    return {
      user: JSON.parse(JSON.stringify(user)),
      transactions: formattedTransactions,
      categories: plainCategories,
      mainCurrency,
      rateMap,
    };
  } catch (error) {
    console.error("Error fetching transactions data:", error);
    return null;
  }
}
