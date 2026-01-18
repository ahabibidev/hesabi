// app/(app)/recurring-bills/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getRecurringBills } from "@/lib/db";
import DashboardLayout from "../dashboard/DashboardLayout";
import RecurringBillsClientWrapper from "@/components/recurring-bills/RecurringBillsClientWrapper";

export const metadata = {
  title: "Recurring Bills | Hesabi",
  description: "View and manage your recurring bills and subscriptions",
};

export default async function RecurringBillsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch recurring bills from database
  const recurringBills = await getRecurringBills(session.user.id);

  return (
    <DashboardLayout>
      <RecurringBillsClientWrapper recurringBills={recurringBills} />
    </DashboardLayout>
  );
}
