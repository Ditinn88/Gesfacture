"use client";

import React from "react";
import "./landing.css";

import { LandingNavbar } from "@/components/landing/navbar";
import { LandingHero } from "@/components/landing/hero";
import { InteractiveInvoice } from "@/components/landing/interactive-invoice";
import { PainPoints } from "@/components/landing/pain-points";
import { BentoFeatures } from "@/components/landing/bento-features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="bg-brand-surface text-brand-navy antialiased font-sans selection:bg-brand-deep selection:text-white relative overflow-x-hidden min-h-screen">
      
      {/* Decorative Hero Background Elements */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none bg-grid-pattern z-0 opacity-70"
      ></div>
      <div
        aria-hidden="true"
        className="fixed -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-purple-100/40 via-indigo-50/30 to-transparent blur-3xl pointer-events-none z-0"
      ></div>

      {/* Floating Pill Navigation */}
      <LandingNavbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <LandingHero />

        {/* Live Interactive Invoice Calculator Preview */}
        <section className="px-4 sm:px-6 relative z-20 pb-16">
          <InteractiveInvoice />
        </section>

        {/* Pain Points / Constat */}
        <PainPoints />

        {/* Bento Grid Features */}
        <BentoFeatures />

        {/* How It Works (3 Steps) */}
        <HowItWorks />

        {/* Wall of Love (Testimonials) */}
        <Testimonials />

        {/* Pricing Plans */}
        <Pricing />

        {/* Final Call to Action */}
        <FinalCTA />
      </main>

      {/* Main Footer */}
      <LandingFooter />

    </div>
  );
}
