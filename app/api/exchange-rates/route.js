// app/api/exchange-rates/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getUserById,
  getExchangeRates,
  upsertExchangeRate,
  deleteExchangeRate,
} from "@/lib/db";
import { CURRENCY_OPTIONS } from "@/lib/constants";
import { NextResponse } from "next/server";

const SUPPORTED = new Set(CURRENCY_OPTIONS.map((c) => c.code));

async function requireUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await getUserById(session.user.id);
  if (!user) return null;

  return { id: session.user.id, mainCurrency: user.currency || "USD" };
}

export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rates = await getExchangeRates(user.id, user.mainCurrency);

    return NextResponse.json({ mainCurrency: user.mainCurrency, rates });
  } catch (error) {
    console.error("Error reading exchange rates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency, rate } = await request.json();

    if (!SUPPORTED.has(currency)) {
      return NextResponse.json(
        { error: "Unsupported currency" },
        { status: 400 },
      );
    }

    if (currency === user.mainCurrency) {
      return NextResponse.json(
        { error: "A currency cannot have a rate against itself" },
        { status: 400 },
      );
    }

    const parsed = Number(rate);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json(
        { error: "Rate must be a number greater than 0" },
        { status: 400 },
      );
    }

    await upsertExchangeRate(user.id, user.mainCurrency, currency, parsed);

    const rates = await getExchangeRates(user.id, user.mainCurrency);
    return NextResponse.json({ message: "Rate saved", rates });
  } catch (error) {
    console.error("Error saving exchange rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currency = new URL(request.url).searchParams.get("currency");

    if (!currency || !SUPPORTED.has(currency)) {
      return NextResponse.json(
        { error: "Unsupported currency" },
        { status: 400 },
      );
    }

    await deleteExchangeRate(user.id, user.mainCurrency, currency);

    const rates = await getExchangeRates(user.id, user.mainCurrency);
    return NextResponse.json({ message: "Rate removed", rates });
  } catch (error) {
    console.error("Error deleting exchange rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
