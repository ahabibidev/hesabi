// lib/dashboard.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDashboardSummary, getUserById } from "@/lib/db";

export async function getDashboardData() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return null;
    }

    const user = getUserById(session.user.id);
    const summary = getDashboardSummary(session.user.id);

    return {
      user,
      summary,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}
