// app/api/user/profile/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryOne, execute, deleteUser } from "@/lib/db";
import { NextResponse } from "next/server";
import { signOut } from "next-auth/react";

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await queryOne(
      `SELECT 
        id, email, name, last_name, avatar, oauth_avatar, currency, theme, created_at 
      FROM users 
      WHERE id = ?`,
      [session.user.id],
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.name || "",
        lastName: user.last_name || "",
        avatar: user.avatar || "/avatars/user.png",
        oauthAvatar: user.oauth_avatar || null,
        currency: user.currency || "USD",
        theme: user.theme || "light",
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, avatar, currency, theme } = body;

    // --- Input Validation ---
    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      const sanitizedFirstName = firstName.trim().replace(/(<([^>]+)>)/gi, "");
      updates.push("name = ?");
      values.push(sanitizedFirstName);
    }

    if (lastName !== undefined) {
      const sanitizedLastName = lastName.trim().replace(/(<([^>]+)>)/gi, "");
      updates.push("last_name = ?");
      values.push(sanitizedLastName);
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
      
      const existingUser = await queryOne(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [normalizedEmail, session.user.id],
      );

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }

      updates.push("email = ?");
      values.push(normalizedEmail);
    }

    if (avatar !== undefined) {
      // A more robust validation would check if the avatar is a valid URL or path
      updates.push("avatar = ?");
      values.push(avatar);
    }

    if (currency !== undefined) {
      if (!/^[A-Z]{3}$/.test(currency)) {
        return NextResponse.json({ error: "Invalid currency format" }, { status: 400 });
      }
      updates.push("currency = ?");
      values.push(currency);
    }

    if (theme !== undefined) {
      if (!["light", "dark"].includes(theme)) {
        return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
      }
      updates.push("theme = ?");
      values.push(theme);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }
    // --- End Input Validation ---

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(session.user.id);

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    await execute(query, values);

    // ✅ Add oauth_avatar to SELECT
    const updatedUser = await queryOne(
      `SELECT id, email, name, last_name, avatar, oauth_avatar, currency, theme 
       FROM users WHERE id = ?`,
      [session.user.id],
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.name || "",
        lastName: updatedUser.last_name || "",
        avatar: updatedUser.avatar || "/avatars/user.png",
        oauthAvatar: updatedUser.oauth_avatar || null, // ✅ Add this
        currency: updatedUser.currency || "USD",
        theme: updatedUser.theme || "light",
      },
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

// DELETE - Delete user account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUser(session.user.id);

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
