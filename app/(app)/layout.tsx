"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SearchProvider } from "@/lib/search-context";
import { DataProvider } from "@/lib/data-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { SyncErrorBanner } from "@/components/layout/sync-error-banner";
import { LocalImportBanner } from "@/components/layout/local-import-banner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Auto-close mobile sidebar whenever route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <DataProvider>
      <SearchProvider>
        <div className="min-h-screen bg-[#fafaf9] dark:bg-[#121212] text-foreground flex">
          {/* Sidebar Navigation */}
          <div className="no-print">
            <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-[250px] transition-all">
            {/* Top Header Bar with prominent Search Bar */}
            <div className="no-print">
              <Topbar onToggleSidebar={handleToggleSidebar} />
            </div>

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1680px] w-full">
              <SyncErrorBanner />
              <LocalImportBanner />
              {children}
            </main>
          </div>
        </div>

        {/* Auth Modal for Supabase Login / Signup */}
        <AuthModal />
      </SearchProvider>
    </DataProvider>
  );
}
