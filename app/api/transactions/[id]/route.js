// app/api/transactions/[id]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getUserById,
} from "@/lib/db";
import { NextResponse } from "next/server";
import { resolveEntryAmounts } from "@/lib/currency";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = Number(id);

    if (!Number.isFinite(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction id" }, { status: 400 });
    }

    const transaction = await getTransactionById(transactionId, session.user.id);

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = Number(id);

    if (!Number.isFinite(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction id" }, { status: 400 });
    }

    const body = await request.json();

    // --- Input Validation ---
    if (body.amount !== undefined) {
      const user = await getUserById(session.user.id);
      const money = resolveEntryAmounts({
        amount: body.amount,
        originalAmount: body.originalAmount,
        originalCurrency: body.originalCurrency,
        exchangeRate: body.exchangeRate,
        mainCurrency: user?.currency || "USD",
      });

      if (money.error) {
        return NextResponse.json({ error: money.error }, { status: 400 });
      }

      // Recomputed server-side so the stored value cannot disagree with the
      // rate stored beside it.
      body.amount = money.amount;
      body.originalAmount = money.originalAmount;
      body.originalCurrency = money.originalCurrency;
      body.exchangeRate = money.exchangeRate;
    }

    if (body.date && Number.isNaN(new Date(body.date).getTime())) {
      return NextResponse.json(
        { error: "Date must be a valid date" },
        { status: 400 }
      );
    }

    if (body.type && !["income", "expense"].includes(body.type)) {
      return NextResponse.json(
        { error: "Type must be either 'income' or 'expense'" },
        { status: 400 }
      );
    }
    // --- End Input Validation ---

    const updated = await updateTransaction(transactionId, session.user.id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Transaction not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction updated successfully" });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = Number(id);

    if (!Number.isFinite(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction id" }, { status: 400 });
    }

    const deleted = await deleteTransaction(transactionId, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
