// lib/pots.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPots, getUserById } from "@/lib/db";

export async function getPotsData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const user = getUserById(session.user.id);
    const pots = getPots(session.user.id);

    // Transform pots to match the expected format
    const formattedPots = pots.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || p.name,
      target: p.target_amount,
      saved: p.saved_amount || 0,
      color: p.color || "#3B82F6",
      icon: p.icon || "piggy-bank",
      deadline: p.deadline,
      createdAt: p.created_at,
      progressColor: p.color || "#3B82F6",
    }));

    return {
      user,
      pots: formattedPots,
    };
  } catch (error) {
    console.error("Error fetching pots data:", error);
    return null;
  }
}
