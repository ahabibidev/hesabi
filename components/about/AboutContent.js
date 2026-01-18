// components/about/AboutContent.jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ScrollText,
  Github,
  Linkedin,
  Globe,
  Heart,
  Code2,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Database,
  Palette,
  BarChart3,
  Lock,
  Layout,
} from "lucide-react";

const APP_INFO = {
  name: "Hesabi",
  version: "1.0.0",
  tagline: "Know Where Your Money Goes",
  year: new Date().getFullYear(),
  description:
    "Hesabi is a modern personal finance management application designed to help you track your income, expenses, and savings with ease. Built with simplicity in mind, it provides powerful insights without the complexity of traditional finance tools.",
};

const DEVELOPER = {
  name: "Ali Reza Habibi",
  title: "Software Engineer",
  image: "/developer.jpg",
  bio: "A passionate software engineer with over 5 years of active coding experience. I love building solutions that make people's lives easier and more organized. Hesabi was created to help individuals take control of their finances without the complexity of traditional finance tools.",
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/shahreyarhabibi",
      icon: Github,
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/ali-reza-habibi",
      icon: Linkedin,
    },
    {
      name: "Portfolio",
      url: "mailto:ahabibi@vercel.com",
      icon: Globe,
    },
  ],
};

const TECHNOLOGIES = [
  {
    name: "Next.js",
    description: "React framework for production",
    icon: Zap,
    color: "bg-black",
  },
  {
    name: "React",
    description: "UI component library",
    icon: Code2,
    color: "bg-sky-500",
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework",
    icon: Palette,
    color: "bg-cyan-500",
  },
  {
    name: "NextAuth.js",
    description: "Authentication for Next.js",
    icon: Lock,
    color: "bg-purple-500",
  },
  {
    name: "Turso DB",
    description: "Edge-hosted SQLite database",
    icon: Database,
    color: "bg-emerald-500",
  },
  {
    name: "Recharts",
    description: "Composable charting library",
    icon: BarChart3,
    color: "bg-orange-500",
  },
  {
    name: "Lucide Icons",
    description: "Beautiful open source icons",
    icon: Layout,
    color: "bg-rose-500",
  },
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Track Everything",
    description:
      "Monitor your income and expenses with detailed categorization",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is encrypted and never shared",
  },
  {
    icon: Sparkles,
    title: "Beautiful Insights",
    description: "Visualize your spending patterns with intuitive charts",
  },
];

export default function AboutContent() {
  return (
    <div className="space-y-8">
      {/* App Header Card */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-6">
          <span className="text-4xl font-bold text-primary">H</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{APP_INFO.name}</h1>
        <p className="text-lg text-primary font-medium mb-4">
          {APP_INFO.tagline}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-sm text-text/70">Version</span>
          <span className="text-sm font-semibold text-primary">
            {APP_INFO.version}
          </span>
        </div>
      </div>

      {/* About App Section */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          About the App
        </h2>
        <p className="text-text/80 leading-relaxed mb-8">
          {APP_INFO.description}
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-4 rounded-xl bg-accent/10 border border-primary/10 hover:border-primary/30 transition-colors"
            >
              <feature.icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-text/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technologies Section */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          Built With
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {TECHNOLOGIES.map((tech) => (
            <div
              key={tech.name}
              className="group p-4 rounded-xl bg-accent/10 border border-text/10 hover:border-primary/30 transition-all hover:scale-[1.02]"
            >
              <div
                className={`w-10 h-10 rounded-lg ${tech.color} flex items-center justify-center mb-3`}
              >
                <tech.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{tech.name}</h3>
              <p className="text-xs text-text/50">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Section */}
      <div className="bg-brand-gradient border border-text/10 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Meet the Developer
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Developer Image */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-primary/20">
              <Image
                src={DEVELOPER.image}
                alt={DEVELOPER.name}
                width={160}
                height={160}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Developer Info */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-1">{DEVELOPER.name}</h3>
            <p className="text-primary font-medium mb-4">{DEVELOPER.title}</p>
            <p className="text-text/70 leading-relaxed mb-6">{DEVELOPER.bio}</p>

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              {DEVELOPER.socials.map((social) => (
                <Link
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 transition-all group"
                >
                  <social.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 ">
        <p className="text-md text-text">
          Made with{" "}
          <Heart className="w-4 h-4 inline-block text-red-500 fill-red-500 mx-1" />{" "}
          by {DEVELOPER.name}
        </p>
        <p className="text-sm text-text/70 mt-2">
          © {APP_INFO.year} {APP_INFO.name}. All rights reserved.
        </p>
        <div className="flex items-center justify-center mt-8">
          <Link
            href="/about/privacy"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <Shield className="w-4 h-4" />
            Privacy Policy
          </Link>
          <span className="mx-4 hidden sm:block text-text/30"> • </span>
          <Link
            href="/about/terms"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ScrollText className="w-4 h-4" />
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
