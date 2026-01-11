// app/settings/page.jsx (Server Component - Main Page)
import Header from "@/components/header/Header";
import DashboardLayout from "../dashboard/DashboardLayout";
import SettingsContent from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <Header
        pageHeader="Settings"
        pageSubHeader="Manage your account settings and preferences."
        buttonDisplay="hidden"
      />
      <SettingsContent />
    </DashboardLayout>
  );
}
