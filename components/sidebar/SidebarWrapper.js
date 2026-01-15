import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserById } from "@/lib/db";
import { DEFAULT_AVATAR } from "@/lib/constants";
import Sidebar from "./Sidebar";

// This is a SERVER component
export default async function SidebarWrapper() {
  // Get the session
  const session = await getServerSession(authOptions);

  // Default user data
  let userData = {
    name: "Guest User",
    last_name: "",
    email: "guest@example.com",
    avatar: DEFAULT_AVATAR,
    initials: "GU",
  };

  // If user is logged in, fetch their data
  if (session?.user?.email) {
    const dbUser = getUserById(session.user.id);

    if (dbUser) {
      userData = {
        name: dbUser.name || session.user.name || "User",
        last_name: dbUser.last_name || session.user.last_name || "",
        email: dbUser.email || session.user.email,
        avatar: dbUser.avatar || session.user.image || DEFAULT_AVATAR,
        initials: getInitials(dbUser.name || session.user.name || "User"),
      };
    }
  }

  return <Sidebar userData={userData} />;
}

// Helper function to generate initials from name
function getInitials(name) {
  if (!name) return "U";

  const nameParts = name.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }

  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}
