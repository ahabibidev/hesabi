// app/pots/page.jsx
import { redirect } from "next/navigation";
import DashboardLayout from "../dashboard/DashboardLayout";
import PotsClientWrapper from "@/components/pots/PotsClientWrapper";
import { getPotsData } from "@/lib/pots";

export default async function PotsPage() {
  const data = await getPotsData();

  if (!data) {
    redirect("/login");
  }

  const { user, pots } = data;

  return (
    <DashboardLayout>
      <PotsClientWrapper
        initialPots={pots}
        currency={user?.currency || "USD"}
      />
    </DashboardLayout>
  );
}
