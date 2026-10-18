"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  href: string;
}

const navLinks: NavItem[] = [
  { label: "Outils gratuits", href: "#interactive-invoice" },
  { label: "Produits", href: "#fonctionnalites" },
  { label: "Blog", href: "#comment-ca-marche" },
  { label: "Ressources", href: "#tarifs" },
];

export function LandingNavbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-4 sm:top-6 inset-x-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none"
      data-purpose="floating-navigation"
    >
      <nav
        className={`w-full max-w-4xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-float-pill rounded-full py-2 px-3 sm:px-6 flex items-center justify-between pointer-events-auto transition-all duration-300 floating-navbar ${
          scrolled ? "shadow-xl border-slate-300/80 bg-white/98" : ""
        }`}
      >
        {/* Brand Logo & Desktop Links */}
        <div className="flex items-center gap-5 sm:gap-7">
          <Link
            href="/"
            aria-label="GesFacture Accueil"
            className="flex items-center gap-2 group mr-1 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#110829] flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M7 2v20l3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2zm9 13H8v-2h8v2zm0-4H8V9h8v2z"></path>
              </svg>
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#110829]">
              Ges<span className="text-indigo-600">Facture</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-brand-deep transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user ? (
            <Link
              href="/dashboard"
              className="text-xs sm:text-[13px] font-semibold text-slate-700 hover:text-brand-deep px-2 py-1.5 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Tableau de bord</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-xs sm:text-[13px] font-semibold text-slate-700 hover:text-brand-deep px-2 py-1.5 transition-colors"
            >
              Connexion
            </Link>
          )}

          <Link
            href={user ? "/invoices/new" : "#interactive-invoice"}
            className="inline-flex items-center justify-center text-xs sm:text-[13px] font-medium text-white bg-[#110829] hover:bg-[#1f1042] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
          >
            Générer une facture
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center text-slate-700 hover:text-brand-deep rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-20 inset-x-4 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-3xl p-5 pointer-events-auto mobile-drawer-enter z-50">
          <div className="flex flex-col gap-3 font-semibold text-sm text-slate-800">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  Accéder au Tableau de bord
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-xl font-semibold text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Connexion à mon compte
                </Link>
              )}

              <Link
                href="/invoices/new"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-xl font-bold text-sm bg-[#110829] text-white shadow-md hover:bg-[#1f1042] transition-colors"
              >
                Créer une facture maintenant
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
