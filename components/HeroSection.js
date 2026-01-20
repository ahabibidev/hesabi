import backgroundImage from "@/public/hero-section-background.png";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="hidden relative md:flex min-h-screen overflow-hidden rounded-tr-[5vw]">
      {/* Background image */}
      <Image
        src={backgroundImage}
        alt=""
        fill
        className="object-cover"
        priority
      />

      {/* Blue overlay */}
      <div className="absolute inset-0 bg-accent/60" />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-4">
        <h2 className="text-3xl text-center font-semibold text-[#f8fafc] font-sans">
          Know Where Your <br /> Money Goes.
        </h2>
        <p className="text-sm text-white/80 text-center font-sans">
          Your Wallet’s New Best Friend
        </p>
      </div>
    </section>
  );
}
