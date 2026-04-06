"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut, Menu } from "lucide-react";
import { useTheme } from "../app/ThemeProvider";
import SearchCommand from "./SearchCommand";

type VerifiedUser = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

export function Header() {
  const pathname = usePathname();
  const isAdminPage = pathname === "/admin";
  const isDashboardPage = pathname === "/dashboard";
  const isDocsPage = pathname === "/docs";
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useTheme();
  const [user, setUser] = useState<VerifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const checkAuthFromToken = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/verify", {
          method: "GET",
          signal: controller.signal,
        });
        if (!response.ok) {
          if (mounted) {
            setUser(null);
          }
          return;
        }

        const data = await response.json();
        if (mounted) {
          setUser(data?.success ? data.user : null);
        }
      } catch (error) {
        // Ignore fetch abort errors when route changes quickly
        if (controller.signal.aborted) return;
        console.error(error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuthFromToken();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDocsPage) {
      setSidebarOpen(false);
    }
  }, [isDocsPage, setSidebarOpen]);

  if (isAdminPage || isDashboardPage) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/user/verify", { method: "DELETE" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (pathname !== "/docs") {
      router.push(`/docs#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
    <style>{`
      @keyframes mobileMenuFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes mobileMenuSlideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `}</style>
    {mobileMenuOpen && (
      <div
        className="fixed inset-0 z-[60] flex justify-end bg-black/50 md:hidden"
        onClick={closeMobileMenu}
        style={{ animation: "mobileMenuFadeIn 0.2s ease-out" }}
      >
        <div
          className="h-full w-[82%] max-w-[320px] border-l border-slate-800 bg-slate-950 p-4"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "mobileMenuSlideIn 0.24s ease-out" }}
        >
          <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-jetbrains text-sm font-semibold text-slate-100">Quick Menu</span>
            <button
              onClick={closeMobileMenu}
              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-900"
            >
              Close
            </button>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Link href="/docs" onClick={closeMobileMenu} className="rounded-lg border border-slate-800 px-3 py-2 text-center text-sm text-slate-300 transition hover:bg-slate-900">Docs</Link>
            <Link href="/pricing" onClick={closeMobileMenu} className="rounded-lg border border-slate-800 px-3 py-2 text-center text-sm text-slate-300 transition hover:bg-slate-900">Pricing</Link>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <a
              href="https://github.com/RAJIV81205/irctc-connect"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="rounded-lg border border-slate-800 px-3 py-2 text-center text-sm text-slate-300 transition hover:bg-slate-900"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/irctc-connect"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="rounded-lg border border-slate-800 px-3 py-2 text-center text-sm text-slate-300 transition hover:bg-slate-900"
            >
              NPM
            </a>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
            {!loading && !user && (
              <Link
                href="/auth"
                onClick={closeMobileMenu}
                className="rounded-lg bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Sign In
              </Link>
            )}
            {!loading && user && pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                onClick={closeMobileMenu}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-center text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20"
              >
                Dashboard
              </Link>
            )}
            {!loading && user && (
              <button
                onClick={() => { closeMobileMenu(); handleLogout(); }}
                className="rounded-lg border border-red-500/30 px-3 py-2 text-center text-sm text-red-300 transition hover:bg-red-500/10"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    )}
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {isDocsPage && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors lg:hidden text-slate-400 hover:text-slate-100"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <Image src="/icon.png" alt="IRCTC Connect Logo" width={24} height={24} className="h-6 w-6 object-contain" />
            </div>
            <span className="font-jetbrains font-bold text-slate-100 tracking-tight">Irctc-connect</span>
          </Link>

          {isDocsPage && (
            <div className="ml-4 hidden sm:block">
              <SearchCommand onNavigate={scrollToSection} />
            </div>
          )}
        </div>

        <nav className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5">
            <Link href="/docs" className={`text-sm font-medium transition hover:text-slate-100 ${pathname === "/docs" ? "text-slate-100" : "text-slate-400"}`}>
              Docs
            </Link>
            <Link href="/pricing" className={`text-sm font-medium transition hover:text-slate-100 ${pathname === "/pricing" ? "text-slate-100" : "text-slate-400"}`}>
              Pricing
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4 ml-2">
            <a href="https://github.com/RAJIV81205/irctc-connect" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="GitHub">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a href="https://www.npmjs.com/package/irctc-connect" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="NPM">
              
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"/></svg>
            </a>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-800" />
          
          {!loading && (
            <div className="hidden md:flex items-center">
              {user ? (
                pathname === "/dashboard" ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/dashboard"
                    className="group flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 transition hover:bg-emerald-500/20"
                  >
                    Dashboard
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )
              ) : (
                <Link
                  href="/auth"
                  className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Sign In
                </Link>
              )}
            </div>
          )}

          {isDocsPage ? (
            <div className="md:hidden">
              <SearchCommand onNavigate={scrollToSection} />
            </div>
          ) : (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-100 md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </nav>
      </div>
    </header>
    </>
  );
}
