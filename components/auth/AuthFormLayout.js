// components/auth/AuthFormLayout.jsx
import Image from "next/image";
import Link from "next/link";
import googleLogo from "@/public/google.svg";
import facebookLogo from "@/public/facebook.svg";
import githubLogo from "@/public/github.svg";

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
  return (
    <section className="flex bg-[#2A5BC0]">
      <div className="flex w-full min-h-screen items-center bg-background justify-center md:rounded-bl-[5vw] md:rounded-tr-none rounded-bl-[20vw] rounded-tr-[20vw]">
        <div className="flex w-3/4 min-h-screen flex-col items-center justify-center gap-5">
          <div className="flex flex-col md:items-start items-center gap-2">
            <h1 className="mb-5 text-4xl font-bold text-primary">Logo</h1>
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
                disabled={disabled}
                className="cursor-pointer bg-primary p-3 rounded-md text-md font-semibold text-background hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {buttonText}
              </button>
            </form>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            <p className="text-text">or</p>
            <div className="flex gap-7">
              <button
                type="button"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Sign in with Google"
              >
                <Image width={30} src={googleLogo} alt="google logo" />
              </button>
              <button
                type="button"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Sign in with Facebook"
              >
                <Image width={35} src={facebookLogo} alt="facebook logo" />
              </button>
              <button
                id="github-logo"
                type="button"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Sign in with Apple"
              >
                <Image width={35} src={githubLogo} alt="github logo" />
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
