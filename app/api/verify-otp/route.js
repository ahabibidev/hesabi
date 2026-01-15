// app/api/verify-otp/route.js
import { NextResponse } from "next/server";
import { verifyOTP, markEmailVerified, getDb } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, otp, userId } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Verify OTP
    const result = verifyOTP(email, otp);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.reason || "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Mark email as verified
    if (userId) {
      markEmailVerified(userId);
    } else {
      // Find user by email and verify
      const db = getDb();
      const user = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(email);

      if (user) {
        markEmailVerified(user.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
