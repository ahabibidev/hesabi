// app/api/pots/[id]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPotById, updatePot, deletePot } from "@/lib/db";
import { NextResponse } from "next/server";

// GET single pot by ID
export async function GET(request, { params }) {
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

    const pot = await getPotById(potId, session.user.id);

    if (!pot) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    return NextResponse.json({ pot });
  } catch (error) {
    console.error("Error fetching pot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// UPDATE pot
export async function PATCH(request, { params }) {
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

    // Validate required fields
    if (body.name !== undefined && !body.name.trim()) {
      return NextResponse.json(
        { error: "Pot name is required" },
        { status: 400 },
      );
    }

    if (body.targetAmount !== undefined && body.targetAmount <= 0) {
      return NextResponse.json(
        { error: "Target amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Check if pot exists
    const existingPot = await getPotById(potId, session.user.id);

    if (!existingPot) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    // Convert undefined to null for database compatibility
    const updateData = {
      name: body.name ?? null,
      description: body.description ?? null,
      targetAmount: body.targetAmount ?? null,
      color: body.color ?? null,
      icon: body.icon ?? null,
      deadline: body.deadline ?? null,
    };

    // Update the pot
    const updated = await updatePot(potId, session.user.id, updateData);

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update pot" },
        { status: 500 },
      );
    }

    // Get updated pot
    const updatedPot = await getPotById(potId, session.user.id);

    return NextResponse.json({
      message: "Pot updated successfully",
      pot: updatedPot,
    });
  } catch (error) {
    console.error("Error updating pot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE pot
export async function DELETE(request, { params }) {
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

    // Check if pot exists
    const existingPot = await getPotById(potId, session.user.id);

    if (!existingPot) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    const deleted = await deletePot(potId, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Failed to delete pot" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Pot deleted successfully" });
  } catch (error) {
    console.error("Error deleting pot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
