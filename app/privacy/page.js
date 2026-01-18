// app/privacy/page.js
import DashboardLayout from "../dashboard/DashboardLayout";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata = {
  title: "Privacy Policy | Hesabi",
  description: "Privacy Policy for Hesabi - Learn how we protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="m-10">
      <PrivacyContent />
    </div>
  );
}
