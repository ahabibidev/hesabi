// app/api/send-otp/route.js
import { NextResponse } from "next/server";
import {
  createOTP,
  checkOTPRateLimit,
  incrementOTPRequestCount,
} from "@/lib/db";
import { sendOTPEmail } from "@/lib/email"; // Your email function

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit
    const rateLimit = await checkOTPRateLimit(normalizedEmail);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: rateLimit.blocked
            ? "Too many requests. Please try again in 1 hour."
            : `Please wait ${rateLimit.waitTime} seconds before requesting again.`,
          blocked: rateLimit.blocked || false,
          waitTime: rateLimit.waitTime,
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 429 },
      );
    }

    // Create OTP
    const otp = await createOTP(normalizedEmail);

    // Increment request count
    await incrementOTPRequestCount(normalizedEmail);

    // Send email
    try {
      await sendOTPEmail(normalizedEmail, otp);
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      remainingAttempts: rateLimit.remainingAttempts - 1,
      expiresIn: 600, // 10 minutes
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
