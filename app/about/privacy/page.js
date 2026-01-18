// app/privacy/page.js
import DashboardLayout from "../../dashboard/DashboardLayout";
import PrivacyContent from "@/components/legal/PrivacyContent";

export const metadata = {
  title: "Privacy Policy | Hesabi",
  description: "Privacy Policy for Hesabi - Learn how we protect your data.",
};

export default function PrivacyPage() {
  return (
    <DashboardLayout
      title="Privacy Policy"
      subtitle="How we handle your data"
      buttonDisplay="hidden"
    >
      <PrivacyContent />
    </DashboardLayout>
  );
}
