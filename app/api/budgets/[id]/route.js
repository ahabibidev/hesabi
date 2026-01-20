// app/api/budgets/[id]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getBudgetById, updateBudget, deleteBudget } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const budgetId = Number(id);

    if (!Number.isFinite(budgetId)) {
      return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
    }

    const budget = await getBudgetById(budgetId, session.user.id);

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Error fetching budget:", error);
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
    const budgetId = Number(id);

    if (!Number.isFinite(budgetId)) {
      return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
    }

    const body = await request.json();

    if (
      body.maxAmount !== undefined &&
      (Number.isNaN(parseFloat(body.maxAmount)) ||
        parseFloat(body.maxAmount) <= 0)
    ) {
      return NextResponse.json(
        { error: "maxAmount must be a number greater than 0" },
        { status: 400 },
      );
    }

    if (body.startDate && Number.isNaN(new Date(body.startDate).getTime())) {
      return NextResponse.json(
        { error: "startDate must be a valid date" },
        { status: 400 },
      );
    }

    if (body.endDate && Number.isNaN(new Date(body.endDate).getTime())) {
      return NextResponse.json(
        { error: "endDate must be a valid date" },
        { status: 400 },
      );
    }

    if (
      body.startDate &&
      body.endDate &&
      new Date(body.startDate).getTime() > new Date(body.endDate).getTime()
    ) {
      return NextResponse.json(
        { error: "startDate cannot be after endDate" },
        { status: 400 },
      );
    }

    const updated = await updateBudget(budgetId, session.user.id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Budget not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Budget updated successfully" });
  } catch (error) {
    console.error("Error updating budget:", error);
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
    const budgetId = Number(id);

    if (!Number.isFinite(budgetId)) {
      return NextResponse.json({ error: "Invalid budget id" }, { status: 400 });
    }

    const deleted = await deleteBudget(budgetId, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
