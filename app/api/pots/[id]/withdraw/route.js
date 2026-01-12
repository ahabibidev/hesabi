// app/api/pots/[id]/withdraw/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { withdrawFromPot } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const pot = withdrawFromPot(
      parseInt(id),
      session.user.id,
      parseFloat(amount),
      note
    );

    return NextResponse.json({
      message: "Withdrawal successful",
      pot,
    });
  } catch (error) {
    console.error("Error withdrawing from pot:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
