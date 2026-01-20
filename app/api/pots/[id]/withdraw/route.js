// app/api/pots/[id]/withdraw/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPotById, withdrawFromPot } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const potId = Number(id);

    if (!Number.isFinite(potId)) {
      return NextResponse.json({ error: "Invalid pot id" }, { status: 400 });
    }

    const body = await request.json();
    const { amount, note } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Check if pot exists
    const existingPot = await getPotById(potId, session.user.id);

    if (!existingPot) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    // Check if there's enough balance
    if (existingPot.saved_amount < parseFloat(amount)) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          available: existingPot.saved_amount,
          requested: parseFloat(amount),
        },
        { status: 400 },
      );
    }

    // Withdraw money from pot
    const updatedPot = await withdrawFromPot(
      potId,
      session.user.id,
      parseFloat(amount),
      note || null,
    );

    return NextResponse.json({
      message: "Money withdrawn successfully",
      pot: updatedPot,
    });
  } catch (error) {
    console.error("Error withdrawing from pot:", error);

    // Handle insufficient balance error from db function
    if (error.message === "Insufficient balance in pot") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
