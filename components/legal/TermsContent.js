// components/legal/TermsContent.jsx
"use client";

import Link from "next/link";
import {
  ScrollText,
  UserCheck,
  Shield,
  AlertTriangle,
  Ban,
  Scale,
  FileText,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";

const APP_INFO = {
  name: "Hesabi",
  email: "contact@ahabibi.dev",
  lastUpdated: "January 15, 2026",
};

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    icon: CheckCircle2,
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using Hesabi, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this application.",
      "These terms apply to all users of the application, including without limitation users who are browsers, customers, and contributors of content.",
    ],
  },
  {
    id: "description",
    icon: Info,
    title: "2. Description of Service",
    content: [
      "Hesabi is a personal finance management application that allows users to track income, expenses, budgets, and savings. The service is provided 'as is' and is intended for personal, non-commercial use.",
      "We reserve the right to modify, suspend, or discontinue any part of the service at any time without prior notice.",
    ],
  },
  {
    id: "accounts",
    icon: UserCheck,
    title: "3. User Accounts",
    content: [
      "To access certain features of Hesabi, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
      "You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.",
      "You must notify us immediately of any unauthorized use of your account or any other breach of security.",
    ],
  },
  {
    id: "responsibilities",
    icon: Shield,
    title: "4. User Responsibilities",
    content: [
      "You are solely responsible for the accuracy of the financial data you enter into Hesabi. The application is a tool for personal tracking and does not constitute financial advice.",
      "You agree not to use the service for any illegal or unauthorized purpose.",
      "You are responsible for maintaining the security of your device and account access.",
    ],
  },
  {
    id: "prohibited",
    icon: Ban,
    title: "5. Prohibited Activities",
    subsections: [
      {
        subtitle: "You agree not to:",
        items: [
          "Use the service for any fraudulent or unlawful purpose",
          "Attempt to gain unauthorized access to our systems or other user accounts",
          "Transmit any viruses, malware, or other malicious code",
          "Interfere with or disrupt the integrity or performance of the service",
          "Collect or harvest any information from the service without permission",
          "Impersonate any person or entity, or falsely state or misrepresent your affiliation",
          "Use automated means to access the service without our express permission",
        ],
      },
    ],
  },
  {
    id: "intellectual-property",
    icon: FileText,
    title: "6. Intellectual Property",
    content: [
      "The Hesabi application, including its original content, features, and functionality, is owned by Ahmad Reza Sharifi and is protected by international copyright, trademark, and other intellectual property laws.",
      "You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any of our content without express written permission.",
    ],
  },
  {
    id: "disclaimer",
    icon: AlertTriangle,
    title: "7. Disclaimer of Warranties",
    content: [
      "Hesabi is provided on an 'AS IS' and 'AS AVAILABLE' basis without any warranties of any kind, either express or implied.",
      "We do not warrant that the service will be uninterrupted, timely, secure, or error-free. We do not warrant the accuracy or reliability of any information obtained through the service.",
      "Hesabi is not a financial advisor. Any financial decisions you make based on the data in this application are your sole responsibility.",
    ],
    highlighted: true,
  },
  {
    id: "limitation",
    icon: Scale,
    title: "8. Limitation of Liability",
    content: [
      "In no event shall Hesabi, its developer, or its affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses.",
      "Our total liability to you for any claims arising from your use of the service shall not exceed the amount you paid us, if any, in the past twelve months.",
    ],
  },
  {
    id: "termination",
    icon: XCircle,
    title: "9. Termination",
    content: [
      "We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.",
      "Upon termination, your right to use the service will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive.",
    ],
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "10. Changes to Terms",
    content: [
      "We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice of any material changes by updating the 'Last Updated' date.",
      "Your continued use of the service after any changes constitutes acceptance of the new Terms.",
    ],
  },
];

export default function TermsContent() {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <ScrollText className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Terms of Service</h1>
            <p className="text-text/60 text-sm">
              Last updated: {APP_INFO.lastUpdated}
            </p>
          </div>
        </div>
        <p className="text-text/70 leading-relaxed">
          Welcome to {APP_INFO.name}. These Terms of Service govern your use of
          our personal finance management application. By using Hesabi, you
          agree to comply with and be bound by these terms.
        </p>
      </div>

      {/* Terms Sections */}
      {TERMS_SECTIONS.map((section) => (
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

            {section.subsections?.map((sub, subIndex) => (
              <div key={subIndex}>
                <p className="font-medium text-foreground mb-3">
                  {sub.subtitle}
                </p>
                <ul className="space-y-2 ml-4">
                  {sub.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Contact Section */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          11. Contact Us
        </h2>
        <p className="text-text/70 leading-relaxed mb-4">
          If you have any questions about these Terms of Service, please contact
          us:
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
          href="/about/privacy"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <Shield className="w-4 h-4" />
          Privacy Policy
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
