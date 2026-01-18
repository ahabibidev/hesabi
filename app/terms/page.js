// app/terms/page.js
import DashboardLayout from "../dashboard/DashboardLayout";
import TermsContent from "@/components/legal/TermsContent";

export const metadata = {
  title: "Terms of Service | Hesabi",
  description: "Terms of Service for using Hesabi.",
};

export default function TermsPage() {
  return (
    <div className="m-10">
      <TermsContent />
    </div>
  );
}
