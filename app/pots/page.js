import DashboardLayout from "../dashboard/DashboardLayout";
import PotsClientWrapper from "@/components/pots/PotsClientWrapper";
import { potsData } from "@/data/transactionsData";

// This is a SERVER component
export default function PotsPage() {
  return (
    <DashboardLayout>
      <PotsClientWrapper initialPots={potsData} />
    </DashboardLayout>
  );
}
