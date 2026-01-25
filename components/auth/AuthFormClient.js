// components/auth/AuthFormClient.jsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import AuthFormLayout from "./AuthFormLayout";
import PasswordInput from "./PasswordInput";
import OTPModal from "./OTPModal";
import Link from "next/link";

export function SignUpFormClient() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (!formData.firstName.trim()) {
      setError("Please enter your first name");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Please enter your last name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Store registration data (including password for auto-login)
      setRegistrationData({
        email: formData.email,
        password: formData.password, // Keep password for auto-login
        userId: data.userId,
      });
      setShowOTPModal(true);
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otp) => {
    setOtpLoading(true);
    try {
      if (!registrationData) {
        throw new Error("Registration data not found");
      }

      // Step 1: Verify OTP
      const verifyResponse = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrationData.email,
          otp: otp,
          userId: registrationData.userId,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || "Invalid OTP");
      }

      // Step 2: Auto-login after successful verification
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: registrationData.email,
        password: registrationData.password,
      });

      if (signInResult?.error) {
        // If auto-login fails, redirect to login page
        console.error("Auto-login failed:", signInResult.error);
        setShowOTPModal(false);
        router.push("/login?verified=true");
        return;
      }

      // Step 3: Close modal and redirect to dashboard
      setShowOTPModal(false);

      // Clear sensitive data
      setRegistrationData(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error; // Let OTP modal handle the error
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      if (!registrationData) {
        throw new Error("Registration data not found");
      }

      const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: registrationData.email,
          userId: registrationData.userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "Failed to resend OTP");
        error.response = { data };
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Failed to resend OTP:", error);
      throw error;
    }
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    // Don't clear registration data so user can try again
  };

  return (
    <>
      <AuthFormLayout
        title="Create Your Account"
        subtitle="Join us and start tracking your money."
        buttonText={loading ? "Creating account..." : "Sign Up"}
        footerText="Already have an account? "
        footerLinkText="Sign In"
        footerLink="/login"
        onSubmit={handleSubmit}
        disabled={loading}
      >
        {/* First Name and Last Name Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="firstName" className="font-semibold">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your First Name"
              className="w-full rounded-sm border border-gray-300 p-2 focus:outline-primary/70"
              required
              disabled={loading}
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <label htmlFor="lastName" className="font-semibold">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your Last Name"
              className="w-full rounded-sm border border-gray-300 p-2 focus:outline-primary/70"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your Email"
            className="w-full rounded-sm border border-gray-300 p-2 focus:outline-primary/70"
            required
            disabled={loading}
          />
        </div>

        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter your Password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Re-enter your Password"
          label="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
        />

        {/* Terms and Conditions */}
        <div className="mt-3">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 mt-1"
              required
              disabled={loading}
            />
            <span className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
      </AuthFormLayout>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        onVerify={handleVerifyOTP}
        email={registrationData?.email || ""}
        resendOtp={handleResendOTP}
        isLoading={otpLoading}
      />
    </>
  );
}

// Keep LoginFormClient the same...
export function LoginFormClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth errors or registration success
  useEffect(() => {
    const errorParam = searchParams.get("error");
    const registered = searchParams.get("registered");
    const verified = searchParams.get("verified");

    if (errorParam) {
      switch (errorParam) {
        case "OAuthAccountNotLinked":
          setError(
            "This email is already registered. Please sign in with your original method.",
          );
          break;
        case "OAuthSignin":
        case "OAuthCallback":
          setError("Error during sign in. Please try again.");
          break;
        case "CredentialsSignin":
          setError("Invalid email or password.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    }

    if (registered === "true") {
      setSuccessMessage("Account created! Please log in.");
    }

    if (verified === "true") {
      setSuccessMessage("Email verified! Please log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (
          result.error.includes("OAuth") ||
          result.error.includes("provider")
        ) {
          setError(result.error);
        } else if (result.error.includes("verify")) {
          setError(result.error);
        } else {
          setError("Invalid email or password");
        }
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthFormLayout
      title="Log in to Your Account"
      subtitle="Welcome back! Please log in to continue."
      buttonText={loading ? "Logging in..." : "Login"}
      footerText="Don't have an account? "
      footerLinkText="Sign Up"
      footerLink="/sign-up"
      onSubmit={handleSubmit}
      disabled={loading}
    >
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
          className="md:min-w-100 w-full rounded-sm border border-gray-300 p-2 focus:outline-primary/70"
          required
          disabled={loading}
        />
      </div>

      <PasswordInput
        id="password"
        name="password"
        placeholder="Enter your Password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
      />

      <div className="flex items-center justify-end">
        <a
          href="/forgot-password"
          className="text-primary  text-sm hover:underline"
        >
          Forgot password?
        </a>
      </div>

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
    </AuthFormLayout>
  );
}
