// app/about/page.js
import DashboardLayout from "../dashboard/DashboardLayout";
import AboutContent from "@/components/about/AboutContent";

export const metadata = {
  title: "About | Hesabi",
  description: "Learn more about Hesabi and the developer behind it.",
};

export default function AboutPage() {
  return (
    <DashboardLayout
      title="About"
      subtitle="Learn more about Hesabi"
      buttonDisplay="hidden"
    >
      <AboutContent />
    </DashboardLayout>
  );
}
