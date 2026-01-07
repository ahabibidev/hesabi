// app/dashboard/layout.jsx
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SideBar from "@/components/sidebar/Sidebar";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - shows as sidebar on desktop, bottom nav on mobile */}
      <SideBar />

      {/* Main Content */}
      <main className="flex-1 mt-10 md:mt-0 overflow-y-auto bg-background pb-20 md:pb-0">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
