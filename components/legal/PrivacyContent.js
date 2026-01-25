// components/legal/PrivacyContent.jsx
"use client";

import Link from "next/link";
import {
  Shield,
  Eye,
  Database,
  Lock,
  Share2,
  Cookie,
  UserCog,
  Clock,
  Baby,
  RefreshCw,
  Mail,
  CheckCircle2,
  Server,
  Fingerprint,
  Info,
  ScrollText,
} from "lucide-react";

const APP_INFO = {
  name: "Hesabi",
  email: "shahreyarhabibi@gmail.com",
  lastUpdated: "January 15, 2026",
};

const DATA_COLLECTED = [
  {
    category: "Account Information",
    items: [
      "Email address",
      "Name (first and last)",
      "Profile avatar",
      "Password (encrypted)",
    ],
    icon: UserCog,
  },
  {
    category: "Financial Data",
    items: [
      "Transaction records (income & expenses)",
      "Budget information",
      "Savings goals (Pots)",
      "Category preferences",
    ],
    icon: Database,
  },
  {
    category: "OAuth Data",
    items: [
      "Google account info (if using Google sign-in)",
      "GitHub account info (if using GitHub sign-in)",
      "Profile pictures from connected accounts",
    ],
    icon: Share2,
  },
  {
    category: "Technical Data",
    items: [
      "Browser type and version",
      "Device information",
      "Session data",
      "Authentication tokens",
    ],
    icon: Server,
  },
];

const PRIVACY_SECTIONS = [
  {
    id: "collection",
    icon: Eye,
    title: "1. Information We Collect",
    content: [
      "We collect information that you provide directly to us when you create an account, use our services, or communicate with us. This includes:",
    ],
    hasDataGrid: true,
  },
  {
    id: "usage",
    icon: Fingerprint,
    title: "2. How We Use Your Information",
    subsections: [
      {
        subtitle: "We use the information we collect to:",
        items: [
          "Provide, maintain, and improve our services",
          "Process and track your financial transactions",
          "Generate insights and reports about your spending",
          "Authenticate your identity and secure your account",
          "Send you technical notices and support messages",
          "Respond to your comments, questions, and requests",
        ],
      },
    ],
  },
  {
    id: "storage",
    icon: Database,
    title: "3. Data Storage & Security",
    content: [
      "Your data is stored securely using Turso, an edge-hosted SQLite database. We implement industry-standard security measures to protect your personal information.",
    ],
    features: [
      { icon: Lock, text: "Passwords are hashed using bcrypt encryption" },
      {
        icon: Shield,
        text: "All data transmitted over secure HTTPS connections",
      },
      {
        icon: Server,
        text: "Data stored in secure, distributed edge databases",
      },
      {
        icon: Fingerprint,
        text: "JWT-based authentication for secure sessions",
      },
    ],
  },
  {
    id: "third-party",
    icon: Share2,
    title: "4. Third-Party Services",
    content: [
      "We integrate with the following third-party services to provide authentication options:",
    ],
    thirdParties: [
      {
        name: "Google OAuth",
        description:
          "Used for 'Sign in with Google' functionality. We receive your name, email, and profile picture.",
        link: "https://policies.google.com/privacy",
      },
      {
        name: "GitHub OAuth",
        description:
          "Used for 'Sign in with GitHub' functionality. We receive your name, email, and avatar.",
        link: "https://docs.github.com/en/site-policy/privacy-policies",
      },
    ],
    note: "We do not sell, trade, or otherwise transfer your personal information to third parties. Your financial data stays within Hesabi and is never shared.",
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "5. Cookies & Local Storage",
    content: [
      "We use essential cookies and local storage to provide core functionality:",
    ],
    subsections: [
      {
        subtitle: "",
        items: [
          "Authentication session cookies to keep you logged in",
          "Theme preferences (light/dark mode)",
          "Currency preferences",
          "Security tokens for CSRF protection",
        ],
      },
    ],
    note: "We do not use advertising or tracking cookies. All cookies are essential for the application to function properly.",
  },
  {
    id: "rights",
    icon: UserCog,
    title: "6. Your Rights",
    subsections: [
      {
        subtitle: "You have the right to:",
        items: [
          "Access your personal data stored in Hesabi",
          "Update or correct your account information",
          "Delete your account and all associated data",
          "Export your financial data",
          "Withdraw consent for data processing",
          "Request information about how your data is used",
        ],
      },
    ],
    note: "To exercise any of these rights, please contact us using the information provided below.",
  },
  {
    id: "retention",
    icon: Clock,
    title: "7. Data Retention",
    content: [
      "We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days.",
      "Some information may be retained in our backups for a limited period, but will not be actively used or processed.",
    ],
  },
  {
    id: "children",
    icon: Baby,
    title: "8. Children's Privacy",
    content: [
      "Hesabi is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.",
    ],
    highlighted: true,
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "9. Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of any changes by updating the 'Last Updated' date at the top of this policy.",
      "We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.",
    ],
  },
  {
    id: "google-data",
    icon: Shield,
    title: "10. Google API Disclosure",
    content: [
      "Hesabi's use and transfer to any other app of information received from Google APIs will adhere to Google API Services User Data Policy, including the Limited Use requirements.",
    ],
    note: "We only request access to your basic profile information and email address to provide a secure login experience.",
    highlighted: true, // Make this stand out for the Google reviewer
  },
];

export default function PrivacyContent() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
            <p className="text-text/60 text-sm">
              Last updated: {APP_INFO.lastUpdated}
            </p>
          </div>
        </div>
        <p className="text-text/70 leading-relaxed">
          At {APP_INFO.name}, we take your privacy seriously. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your
          information when you use our personal finance application.
        </p>

        {/* Privacy Highlights */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">No data selling</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Encrypted storage</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Your data, your control</span>
          </div>
        </div>
      </div>

      {/* Privacy Sections */}
      {PRIVACY_SECTIONS.map((section) => (
        <div
          key={section.id}
          id={section.id}
          className={`bg-brand-gradient border rounded-2xl p-6 md:p-8 scroll-mt-24 ${
            section.highlighted
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-text/10"
          }`}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                section.highlighted ? "bg-amber-500/20" : "bg-primary/20"
              }`}
            >
              <section.icon
                className={`w-5 h-5 ${
                  section.highlighted ? "text-amber-500" : "text-primary"
                }`}
              />
            </div>
            {section.title}
          </h2>

          <div className="space-y-4 text-text/70 leading-relaxed">
            {section.content?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}

            {/* Data Collection Grid */}
            {section.hasDataGrid && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {DATA_COLLECTED.map((category) => (
                  <div
                    key={category.category}
                    className="p-4 rounded-xl bg-accent/10 border border-text/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <category.icon className="w-5 h-5 text-primary" />
                      <h4 className="font-semibold text-foreground">
                        {category.category}
                      </h4>
                    </div>
                    <ul className="space-y-1.5">
                      {category.items.map((item, index) => (
                        <li
                          key={index}
                          className="text-sm flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Features List */}
            {section.features && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {section.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                  >
                    <feature.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Subsections */}
            {section.subsections?.map((sub, subIndex) => (
              <div key={subIndex}>
                {sub.subtitle && (
                  <p className="font-medium text-foreground mb-3">
                    {sub.subtitle}
                  </p>
                )}
                <ul className="space-y-2 ml-4">
                  {sub.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Third Party Services */}
            {section.thirdParties && (
              <div className="space-y-3 mt-4">
                {section.thirdParties.map((party, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-accent/10 border border-text/10"
                  >
                    <h4 className="font-semibold text-foreground mb-2">
                      {party.name}
                    </h4>
                    <p className="text-sm mb-2">{party.description}</p>
                    <a
                      href={party.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View their privacy policy →
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Note */}
            {section.note && (
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-primary font-medium">
                  {section.note}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Contact Section */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          10. Contact Us
        </h2>
        <p className="text-text/70 leading-relaxed mb-4">
          If you have any questions or concerns about this Privacy Policy or our
          data practices, please don't hesitate to contact us:
        </p>
        <a
          href={`mailto:${APP_INFO.email}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all"
        >
          <Mail className="w-4 h-4 text-primary" />
          <span className="font-medium">{APP_INFO.email}</span>
        </a>
      </div>

      {/* Footer Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 border-t border-text/10">
        <Link
          href="/about/terms"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <ScrollText className="w-4 h-4" />
          Terms of Service
        </Link>
        <span className="hidden sm:block text-text/30">•</span>
        <Link
          href="/about"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <Info className="w-4 h-4" />
          About Hesabi
        </Link>
      </div>
    </div>
  );
}
