"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Moon,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  CreditCard,
  Wallet,
  BarChart3,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState<string>(pathname || "/dashboard");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, openAuthModal, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
    }
  }, []);

  // Synchronize active path with Next.js navigation changes
  useEffect(() => {
    if (pathname) {
      setActivePath(pathname);
    }
  }, [pathname]);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Factures",
      href: "/invoices",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      ),
    },
    {
      name: "Clients",
      href: "/clients",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    { name: "Paiements", href: "/payments", icon: <CreditCard className="w-4 h-4" /> },
    { name: "Trésorerie", href: "/wallet", icon: <Wallet className="w-4 h-4" /> },
    { name: "Rapports & TVA", href: "/reports", icon: <BarChart3 className="w-4 h-4" /> },
    { name: "Budget", href: "/budgeting", icon: <PiggyBank className="w-4 h-4" /> },
  ];

  const utilitairesItems = [
    {
      name: "Paramètres",
      href: "/settings",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      name: "Aide et Support",
      href: "/support",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      ),
    },
  ];

  // Helper to determine exact active link state
  const checkIsActive = (href: string) => {
    if (!activePath) return false;
    const cleanPath = activePath === "/" ? "/dashboard" : activePath.replace(/\/$/, "");
    const cleanHref = href.replace(/\/$/, "");

    if (cleanHref === "/dashboard") {
      return cleanPath === "/dashboard";
    }
    return cleanPath === cleanHref || cleanPath.startsWith(cleanHref + "/");
  };

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const renderNavLink = (item: { name: string; href: string; icon: React.ReactNode }) => {
    const isActive = checkIsActive(item.href);

    return (
      <Link
        key={item.name}
        href={item.href}
        onClick={() => {
          setActivePath(item.href);
          onClose?.();
        }}
        className={cn(
          "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all shadow-none select-none focus:outline-none",
          isActive
            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 font-medium"
        )}
      >
        {/* Subtle active indicator pill on the left border */}
        {isActive && (
          <span className="w-1 h-3.5 rounded-full bg-neutral-900 dark:bg-white -ml-1 transition-all" />
        )}

        <span
          className={cn(
            "transition-colors shrink-0",
            isActive
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300"
          )}
        >
          {item.icon}
        </span>
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop - Smooth Neutral Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container - Optimized for Mobile & Desktop with Perfect Spacing */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[280px] sm:w-[290px] lg:w-[250px] bg-white dark:bg-[#141414] border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out select-none",
          "shadow-2xl shadow-neutral-900/15 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header with Dedicated Mobile Close Button */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            title="Retour à la page d'accueil GesFacture"
            onClick={() => {
              onClose?.();
            }}
          >
            {/* Black rounded square icon with white G */}
            <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-sm shadow-none">
              <span className="font-serif">G</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white font-sans leading-none">
                GESFACTURE
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-1">
                Espace Pro
              </span>
            </div>
          </Link>

          {/* Close button - Perfectly sized, circular tap target */}
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center lg:hidden transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Mobile Quick Action */}
        <div className="px-4 pt-3 pb-1 lg:hidden">
          <Link
            href="/invoices/new"
            onClick={() => {
              setActivePath("/invoices");
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-medium shadow-none transition-colors"
          >
            <span className="text-base font-light leading-none">+</span>
            <span>Nouvelle Facture</span>
          </Link>
        </div>

        {/* Navigation Sections with Balanced Spacing */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-5">
          {/* MENU Category */}
          <div>
            <div className="px-3 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                MENU
              </span>
            </div>

            <nav className="space-y-1">
              {menuItems.map(renderNavLink)}
            </nav>
          </div>

          {/* UTILITAIRES Category */}
          <div>
            <div className="px-3 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                UTILITAIRES
              </span>
            </div>

            <nav className="space-y-1">
              {utilitairesItems.map(renderNavLink)}
            </nav>
          </div>
        </div>

        {/* Bottom Section: User Capsule + Minimalist Dark Mode Switch */}
        <div className="p-3.5 border-t border-neutral-100 dark:border-neutral-800 space-y-2 bg-[#fafaf9]/80 dark:bg-[#141414]">
          {/* User Account Capsule / Profile Card */}
          {user ? (
            <div className="p-3 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-none space-y-2.5">
              {/* User Identity Info */}
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-[11px] flex items-center justify-center shadow-none">
                    {(user.user_metadata?.full_name || user.email || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white truncate leading-none">
                    {user.user_metadata?.full_name || user.email?.split("@")[0] || "Dirigeant"}
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-1">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Status and Role Indicator */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-700/50 text-[10px]">
                <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En ligne (Cloud)</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium">
                  Dirigeant
                </span>
              </div>

              {/* Dedicated Styled Logout Button */}
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100/70 hover:bg-[#fce8e6] hover:text-[#c5221f] hover:border-red-200 dark:bg-neutral-700/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 dark:hover:border-rose-900/50 border border-neutral-200/60 dark:border-neutral-700/40 transition-all duration-150 cursor-pointer shadow-none"
                title="Se déconnecter"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Déconnexion</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60 shadow-none space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none">
                    Mode Invité
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate mt-1">
                    Données locales
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  openAuthModal();
                  onClose?.();
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all duration-150 cursor-pointer shadow-none"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Se connecter</span>
              </button>
            </div>
          )}

          {/* Dark Mode Switch */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="text-[11px] font-medium flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-neutral-400" />
              <span>Mode Sombre</span>
            </span>
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={cn(
                "relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isDark ? "bg-neutral-700" : "bg-neutral-200"
              )}
              role="switch"
              aria-checked={isDark}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-none ring-0 transition duration-200 ease-in-out",
                  isDark ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
