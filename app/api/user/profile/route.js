// app/api/user/profile/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryOne, execute } from "@/lib/db";
import { NextResponse } from "next/server";

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

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (firstName !== undefined) {
      updates.push("name = ?");
      values.push(firstName.trim());
    }

    if (lastName !== undefined) {
      updates.push("last_name = ?");
      values.push(lastName.trim());
    }

    if (email !== undefined) {
      const existingUser = await queryOne(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, session.user.id],
      );

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }

      updates.push("email = ?");
      values.push(email);
    }

    if (avatar !== undefined) {
      updates.push("avatar = ?");
      values.push(avatar);
    }

    if (currency !== undefined) {
      updates.push("currency = ?");
      values.push(currency);
    }

    if (theme !== undefined) {
      updates.push("theme = ?");
      values.push(theme);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");

    if (updates.length === 1) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

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
