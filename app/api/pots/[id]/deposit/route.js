// app/api/pots/[id]/deposit/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { addToPot } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { amount, note } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const pot = addToPot(
      parseInt(id),
      session.user.id,
      parseFloat(amount),
      note || null
    );

    if (!pot) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Deposit successful",
      pot: {
        id: pot.id,
        name: pot.name,
        saved_amount: pot.saved_amount,
        target_amount: pot.target_amount,
      },
    });
  } catch (error) {
    console.error("Error depositing to pot:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
