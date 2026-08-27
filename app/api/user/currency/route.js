// app/api/user/currency/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById, changeMainCurrency } from "@/lib/db";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import { NextResponse } from "next/server";

const SUPPORTED = new Set(CURRENCY_OPTIONS.map((c) => c.code));

/**
 * Switches the user's main currency.
 *
 * `convert: true` rescales every stored main-currency figure by `rate`, which
 * is what you want when the numbers really were in the old currency.
 * `convert: false` only relabels — for when the amounts were already being
 * entered in the new currency and the setting was simply wrong.
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency, convert, rate } = await request.json();

    if (!SUPPORTED.has(currency)) {
      return NextResponse.json(
        { error: "Unsupported currency" },
        { status: 400 },
      );
    }

    const user = await getUserById(session.user.id);
    const from = user?.currency || "USD";

    if (from === currency) {
      return NextResponse.json({ message: "Already the main currency" });
    }

    let factor = null;

    if (convert) {
      factor = Number(rate);
      if (!Number.isFinite(factor) || factor <= 0) {
        return NextResponse.json(
          { error: "A conversion rate greater than 0 is required" },
          { status: 400 },
        );
      }
    }

    await changeMainCurrency(session.user.id, from, currency, factor);

    return NextResponse.json({
      message: "Main currency updated",
      from,
      to: currency,
      converted: Boolean(factor),
    });
  } catch (error) {
    console.error("Error changing main currency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
