// app/api/resend-otp/route.js
import { NextResponse } from "next/server";
import {
  createOTP,
  checkOTPRateLimit,
  incrementOTPRequestCount,
  getDb,
} from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { email, userId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check rate limit
    const rateLimit = checkOTPRateLimit(email);

    if (!rateLimit.allowed) {
      const waitMessage = rateLimit.blocked
        ? `Too many attempts. Please try again in ${Math.ceil(
            rateLimit.waitTime / 60
          )} minutes.`
        : `Please wait ${rateLimit.waitTime} seconds before requesting another code.`;

      return NextResponse.json(
        {
          error: waitMessage,
          waitTime: rateLimit.waitTime,
          blocked: rateLimit.blocked,
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 429 }
      );
    }

    // Get user name for email
    const db = getDb();
    const user = db
      .prepare("SELECT name FROM users WHERE email = ?")
      .get(email);

    const userName = user?.name || "User";

    // Generate and send OTP
    const otp = createOTP(email);
    incrementOTPRequestCount(email);

    const emailResult = await sendOTPEmail(email, otp, userName);

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
