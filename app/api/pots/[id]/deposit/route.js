// app/api/pots/[id]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPotById, updatePot, deletePot } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pot = getPotById(parseInt(id), session.user.id);

    if (!pot) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    return NextResponse.json({ pot });
  } catch (error) {
    console.error("Error fetching pot:", error);
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
    const body = await request.json();

    const result = updatePot(parseInt(id), session.user.id, body);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Pot not found or not updated" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Pot updated successfully" });
  } catch (error) {
    console.error("Error updating pot:", error);
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
    const result = deletePot(parseInt(id), session.user.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Pot not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Pot deleted successfully" });
  } catch (error) {
    console.error("Error deleting pot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
