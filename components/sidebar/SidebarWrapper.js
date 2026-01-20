// components/sidebar/SidebarWrapper.jsx
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
    lastName: "",
    email: "guest@example.com",
    avatar: DEFAULT_AVATAR,
    initials: "GU",
  };

  // If user is logged in, fetch their data
  if (session?.user?.email) {
    const dbUser = await getUserById(session.user.id);

    if (dbUser) {
      const firstName = dbUser.name || session.user.name || "User";
      const lastName = dbUser.last_name || ""; // ✅ Changed from dbUser.lastName to dbUser.last_name

      userData = {
        name: firstName,
        lastName: lastName,
        email: dbUser.email || session.user.email,
        avatar: dbUser.avatar || session.user.image || DEFAULT_AVATAR,
        initials: getInitials(firstName, lastName), // ✅ Pass both names
      };
    }
  }

  return <Sidebar userData={userData} />;
}

function getInitials(firstName, lastName) {
  if (!firstName) return "U";

  // If we have a last name, use first letter of each
  if (lastName && lastName.trim()) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  // Otherwise, fall back to the old logic
  const nameParts = firstName.trim().split(" ");
  if (nameParts.length === 1) {
    return nameParts[0].substring(0, 2).toUpperCase();
  }

  return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
}
