// app/api/register/route.js
import { NextResponse } from "next/server";
import {
  createOTP,
  checkOTPRateLimit,
  incrementOTPRequestCount,
  execute,
  queryOne,
} from "@/lib/db";
import { sendOTPEmail } from "@/lib/email";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const { name, lastName, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limit before anything else to prevent abuse
    const rateLimit = await checkOTPRateLimit(normalizedEmail);
    if (!rateLimit.allowed) {
      const waitMessage = rateLimit.blocked
        ? `Too many attempts. Please try again in ${Math.ceil(rateLimit.waitTime / 60)} minutes.`
        : `Please wait ${rateLimit.waitTime} seconds before requesting another code.`;

      return NextResponse.json(
        {
          error: waitMessage,
          waitTime: rateLimit.waitTime,
          blocked: rateLimit.blocked,
        },
        { status: 429 }
      );
    }
    
    const existingUser = await queryOne(
      "SELECT id, email_verified, password, provider FROM users WHERE email = ?",
      [normalizedEmail]
    );

    // Regardless of user status, we send an OTP to the provided email.
    // This prevents attackers from figuring out which emails are registered.
    const otp = await createOTP(normalizedEmail);
    await incrementOTPRequestCount(normalizedEmail);
    const emailResult = await sendOTPEmail(normalizedEmail, otp, name);

    if (!emailResult.success) {
      console.error("Failed to send OTP email:", emailResult.error);
      // We don't want to leak that the user creation failed because of the email,
      // so we return a generic success-looking response.
      // The user will just not receive the email and can try again later.
      return NextResponse.json(
        {
          success: true,
          message: "If an account with this email exists or can be created, a verification code has been sent.",
          requiresVerification: true,
        },
        { status: 200 }
      );
    }
    
    let userId;
    let status = 201; // Default to 201 Created

    if (existingUser) {
      userId = existingUser.id;
      status = 200; // User already existed, so OK status

      // If user exists but is not verified, update their details.
      if (existingUser.email_verified === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await execute(
          "UPDATE users SET password = ?, name = ?, last_name = ? WHERE id = ?",
          [
            hashedPassword,
            name.trim(),
            lastName?.trim() || null,
            userId,
          ]
        );
      }
      // If user is already verified, we do nothing to their account but still send the OTP
      // as a security measure (e.g., someone might be trying to take over the account).
    } else {
      // Create a new, unverified user.
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await execute(
        `INSERT INTO users (email, password, name, last_name, provider, email_verified) 
         VALUES (?, ?, ?, ?, 'credentials', 0)`,
        [normalizedEmail, hashedPassword, name.trim(), lastName?.trim() || null]
      );
      userId = result.lastInsertRowid;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent to your email.",
        userId: userId,

        requiresVerification: true,
      },
      { status }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
