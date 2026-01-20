// app/api/pots/[id]/deposit/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPotById, addToPot } from "@/lib/db";
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

    // Add money to pot
    const updatedPot = await addToPot(
      potId,
      session.user.id,
      parseFloat(amount),
      note || null,
    );

    return NextResponse.json({
      message: "Money added successfully",
      pot: updatedPot,
    });
  } catch (error) {
    console.error("Error adding money to pot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
