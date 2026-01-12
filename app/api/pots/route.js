// app/api/pots/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPots, createPot } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pots = getPots(session.user.id);

    return NextResponse.json({ pots });
  } catch (error) {
    console.error("Error fetching pots:", error);
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
    const { name, description, targetAmount, color, icon, deadline } = body;

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: "Name and target amount are required" },
        { status: 400 }
      );
    }

    const id = createPot(session.user.id, {
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      color,
      icon,
      deadline,
    });

    return NextResponse.json(
      { message: "Pot created successfully", id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
