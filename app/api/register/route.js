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

    // Check if user already exists (using async function)
    const existingUser = await queryOne(
      "SELECT id, email_verified FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser) {
      // If user exists but not verified, allow re-registration
      if (existingUser.email_verified === 0) {
        // Check rate limit before sending OTP
        const rateLimit = await checkOTPRateLimit(normalizedEmail);

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
            },
            { status: 429 }
          );
        }

        // Update user details
        const hashedPassword = await bcrypt.hash(password, 10);
        await execute(
          "UPDATE users SET password = ?, name = ?, last_name = ? WHERE id = ?",
          [
            hashedPassword,
            name.trim(),
            lastName?.trim() || null,
            existingUser.id,
          ]
        );

        // Generate and send OTP
        const otp = await createOTP(normalizedEmail);
        await incrementOTPRequestCount(normalizedEmail);

        const emailResult = await sendOTPEmail(normalizedEmail, otp, name);

        if (!emailResult.success) {
          console.error("Failed to send OTP email:", emailResult.error);
          return NextResponse.json(
            { error: "Failed to send verification email. Please try again." },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: "Verification code sent to your email",
            userId: existingUser.id,
            requiresVerification: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Check rate limit before sending OTP
    const rateLimit = await checkOTPRateLimit(normalizedEmail);

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
        },
        { status: 429 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (unverified)
    const result = await execute(
      `INSERT INTO users (email, password, name, last_name, provider, email_verified) 
       VALUES (?, ?, ?, ?, 'credentials', 0)`,
      [normalizedEmail, hashedPassword, name.trim(), lastName?.trim() || null]
    );

    const userId = result.lastInsertRowid;

    // Generate and send OTP
    const otp = await createOTP(normalizedEmail);
    await incrementOTPRequestCount(normalizedEmail);

    const emailResult = await sendOTPEmail(normalizedEmail, otp, name);

    if (!emailResult.success) {
      // Delete the user if email fails
      await execute("DELETE FROM users WHERE id = ?", [userId]);
      console.error("Failed to send OTP email:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent to your email",
        userId: userId,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
