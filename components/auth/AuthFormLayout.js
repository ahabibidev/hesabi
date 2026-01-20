// components/auth/AuthFormLayout.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import googleLogo from "@/public/google.svg";
import githubLogo from "@/public/github.svg";
import darkLogo from "@/public/dark-logo.png";
import lightLogo from "@/public/light-logo.png";

export default function AuthFormLayout({
  title,
  subtitle,
  buttonText,
  children,
  footerText,
  footerLinkText,
  footerLink,
  onSubmit,
  disabled = false,
}) {
  const [oauthLoading, setOauthLoading] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Function to check theme
    const checkTheme = () => {
      // Check if 'dark' class exists on html element
      const htmlElement = document.documentElement;
      const isDarkMode = htmlElement.classList.contains("dark");

      // Also check data-theme attribute as fallback
      const dataTheme = htmlElement.getAttribute("data-theme");

      setIsDark(isDarkMode || dataTheme === "dark");
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  // Select logo based on theme
  const logoSrc = isDark ? darkLogo : lightLogo;

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="bg-brand-gradient border border-text/10 rounded-2xl p-8 text-center h-48" />
        <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8 h-96" />
      </div>
    );
  }

  const handleOAuthSignIn = async (provider) => {
    try {
      setOauthLoading(provider);
      await signIn(provider, {
        callbackUrl: "/",
      });
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
    } finally {
      setOauthLoading(null);
    }
  };

  const isDisabled = disabled || oauthLoading !== null;

  return (
    <section className="flex bg-[#2A5BC0] md:bg-[#7596D8]">
      <div className="flex w-full min-h-screen items-center bg-background justify-center md:rounded-bl-[5vw] md:rounded-tr-none rounded-bl-[20vw] rounded-tr-[20vw]">
        <div className="flex w-3/4 min-h-screen flex-col items-center justify-center gap-5">
          <div className="flex flex-col md:items-start items-center gap-2">
            <Image
              className="mb-5"
              alt="Heasbi Logo"
              width={200}
              height={50}
              src={logoSrc}
              priority
            />
            <h2 className="md:block hidden text-3xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-text">{subtitle}</p>

            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-5 mt-4 w-full max-w-md"
            >
              {children}
              <button
                type="submit"
                disabled={isDisabled}
                className="cursor-pointer bg-primary p-3 rounded-md text-md font-semibold text-background hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonText}
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <p className="text-text">or</p>
            <div className="flex gap-7">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn("google")}
                disabled={isDisabled}
                className="cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign in with Google"
              >
                {oauthLoading === "google" ? (
                  <div className="w-7.5 h-7.5 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Image width={30} src={googleLogo} alt="google logo" />
                )}
              </button>

              {/* GitHub Button */}
              <button
                id="github-logo"
                type="button"
                onClick={() => handleOAuthSignIn("github")}
                disabled={isDisabled}
                className="cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Sign in with Github"
              >
                {oauthLoading === "github" ? (
                  <div className="w-8.75 h-8.75 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <Image width={35} src={githubLogo} alt="github logo" />
                )}
              </button>
            </div>
          </div>

          <p className="self-center text-text relative top-15">
            {footerText}
            <Link
              href={footerLink}
              className="cursor-pointer font-semibold text-primary underline hover:text-primary/80 transition-colors"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
