// lib/pots.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPots, getUserById, getExchangeRates } from "@/lib/db";
import { buildRateMap } from "@/lib/currency";

export async function getPotsData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    // Add await to all async database functions
    const user = await getUserById(session.user.id);
    const pots = await getPots(session.user.id);

    const mainCurrency = user?.currency || "USD";
    const rateMap = buildRateMap(
      await getExchangeRates(session.user.id, mainCurrency),
    );

    // Add safety check - ensure pots is an array
    if (!Array.isArray(pots)) {
      console.error("Pots is not an array:", typeof pots, pots);
      // Return empty arrays to prevent errors
      return {
        user,
        pots: [],
        mainCurrency,
        rateMap,
      };
    }

    // Transform pots to match the expected format
    const formattedPots = pots.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || p.name,
      target: p.target_amount,
      saved: p.saved_amount || 0,
      // A pot with no currency of its own simply follows the main one.
      currency: p.currency || mainCurrency,
      color: p.color || "#3B82F6",
      icon: p.icon || "piggy-bank",
      deadline: p.deadline,
      createdAt: p.created_at,
      progressColor: p.color || "#3B82F6",
    }));

    return {
      user,
      pots: formattedPots,
      mainCurrency,
      rateMap,
    };
  } catch (error) {
    console.error("Error fetching pots data:", error);
    // Return a safe default structure instead of null
    return {
      user: null,
      pots: [],
      mainCurrency: "USD",
      rateMap: {},
    };
  }
}
