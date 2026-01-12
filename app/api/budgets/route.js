// app/api/budgets/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getBudgets, createBudget } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const budgets = getBudgets(session.user.id);

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, name, maxAmount, color, period, startDate, endDate } =
      body;

    if (!name || !maxAmount) {
      return NextResponse.json(
        { error: "Name and max amount are required" },
        { status: 400 }
      );
    }

    const id = createBudget(session.user.id, {
      categoryId,
      name,
      maxAmount: parseFloat(maxAmount),
      color,
      period,
      startDate,
      endDate,
    });

    return NextResponse.json(
      { message: "Budget created successfully", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
