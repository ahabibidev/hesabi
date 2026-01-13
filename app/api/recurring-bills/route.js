// app/api/recurring-bills/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRecurringBills } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      search: searchParams.get("search") || undefined,
    };

    const bills = getRecurringBills(session.user.id, options);

    return NextResponse.json({ bills });
  } catch (error) {
    console.error("Error fetching recurring bills:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
