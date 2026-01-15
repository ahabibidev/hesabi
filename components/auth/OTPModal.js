// components/auth/OTPModal.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { FiX, FiClock, FiMail, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function OTPModal({
  isOpen,
  onClose,
  onVerify,
  email = "user@example.com",
  resendOtp,
  isLoading = false,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendError, setResendError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const inputsRef = useRef([]);

  // Timer for OTP expiration
  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0 && !isBlocked) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft, isBlocked]);

  // Timer for block period
  useEffect(() => {
    let timer;
    if (isBlocked && blockTimeLeft > 0) {
      timer = setInterval(() => {
        setBlockTimeLeft((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setRemainingAttempts(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTimeLeft]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(60);
      setError("");
      setResendError("");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => {
        if (inputsRef.current[0]) {
          inputsRef.current[0].focus();
        }
      }, 300);
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const cleanText = text.replace(/\D/g, "").slice(0, 6);
        if (cleanText.length === 6) {
          const digits = cleanText.split("");
          setOtp(digits);
          inputsRef.current[5]?.focus();
        }
      });
    }

    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      await onVerify(otpString);
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || isBlocked) return;

    setIsResending(true);
    setResendError("");

    try {
      const result = await resendOtp();
      setTimeLeft(60);
      setOtp(["", "", "", "", "", ""]);
      setError("");

      if (result?.remainingAttempts !== undefined) {
        setRemainingAttempts(result.remainingAttempts);
      }

      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    } catch (err) {
      const errorData = err.response?.data || {};

      if (errorData.blocked) {
        setIsBlocked(true);
        setBlockTimeLeft(errorData.waitTime || 3600);
        setResendError("Too many attempts. Please try again later.");
      } else if (errorData.waitTime) {
        setTimeLeft(errorData.waitTime);
        setResendError(`Please wait ${errorData.waitTime} seconds.`);
      } else {
        setResendError(
          err.message || "Failed to resend OTP. Please try again."
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-text/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground text-2xl font-bold">
                  Verify Your Email
                </h2>
                <p className="text-text/70 text-sm mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Blocked Warning */}
            {isBlocked && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-6">
                <FiAlertCircle className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    Too many attempts
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500">
                    Try again in {formatTime(blockTimeLeft)}
                  </p>
                </div>
              </div>
            )}

            {/* Email Display */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FiMail className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-text/70">Code sent to</p>
                <p className="font-medium text-foreground break-all">{email}</p>
              </div>
            </div>

            {/* OTP Inputs */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-4">
                Enter 6-digit code
              </label>
              <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isBlocked}
                    className="w-full h-14 text-center text-2xl font-bold rounded-lg border-2 border-text/20 bg-transparent text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {error}
                </p>
              )}
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <FiClock className="text-text/50" />
              <span className="text-sm font-medium text-text/70">
                {timeLeft > 0 ? (
                  <>
                    Code expires in{" "}
                    <span className="font-bold text-foreground">
                      {formatTime(timeLeft)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-500">Code expired</span>
                )}
              </span>
            </div>

            {/* Remaining Attempts */}
            {!isBlocked && remainingAttempts < 3 && (
              <p className="text-center text-sm text-amber-600 dark:text-amber-400 mb-4">
                {remainingAttempts} resend attempt
                {remainingAttempts !== 1 ? "s" : ""} remaining
              </p>
            )}

            {/* Resend Error */}
            {resendError && (
              <p className="text-center text-sm text-red-500 mb-4">
                {resendError}
              </p>
            )}

            {/* Resend OTP */}
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || isResending || isBlocked}
                className={`text-sm font-medium ${
                  timeLeft > 0 || isResending || isBlocked
                    ? "text-text/50 cursor-not-allowed"
                    : "text-primary hover:text-primary/80"
                } transition-colors`}
              >
                {isResending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : isBlocked ? (
                  `Blocked for ${formatTime(blockTimeLeft)}`
                ) : timeLeft > 0 ? (
                  `Resend code in ${formatTime(timeLeft)}`
                ) : (
                  "Resend verification code"
                )}
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg border border-text/20 hover:border-text/40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerify}
                disabled={isLoading || otp.join("").length !== 6 || isBlocked}
                className="flex-1 px-4 py-3 rounded-lg bg-primary text-white font-semibold shadow-lg hover:shadow-xl hover:bg-primary/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-sm text-text/70 text-center">
                Didn't receive the code? Check your spam folder or click{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={timeLeft > 0 || isBlocked}
                  className={`font-medium ${
                    timeLeft > 0 || isBlocked
                      ? "text-text/50 cursor-not-allowed"
                      : "text-primary hover:underline"
                  }`}
                >
                  Resend
                </button>{" "}
                to send again.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
