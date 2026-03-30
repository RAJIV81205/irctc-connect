"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Train, ChevronRight, LogOut, Menu } from "lucide-react";
import { useTheme } from "../app/ThemeProvider";
import SearchCommand from "./SearchCommand";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, sidebarOpen, setSidebarOpen } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await fetch("/api/user/verify", { method: "DELETE" });
      router.push("/");
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {pathname === "/docs" && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors lg:hidden text-slate-400 hover:text-slate-100"
              aria-label="Toggle Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Train className="h-5 w-5" />
            </div>
            <span className="font-jetbrains font-bold text-slate-100 tracking-tight">irctc-connect</span>
          </Link>

          {pathname === "/docs" && (
            <div className="ml-4 hidden sm:block">
              <SearchCommand onNavigate={scrollToSection} />
            </div>
          )}
        </div>

        <nav className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-5">
            <Link href="/docs" className={`text-sm font-medium transition hover:text-slate-100 ${pathname === "/docs" ? "text-slate-100" : "text-slate-400"}`}>
              Docs
            </Link>
            <Link href="/pricing" className={`text-sm font-medium transition hover:text-slate-100 ${pathname === "/pricing" ? "text-slate-100" : "text-slate-400"}`}>
              Pricing
            </Link>
          </div>
          
          <div className="flex items-center gap-4 ml-2">
            <a href="https://github.com/RAJIV81205/irctc-connect" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="GitHub">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a href="https://www.npmberry.com/package/irctc-connect" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors" title="NPM">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M0 7.334v8h2v-6h2v6h2v-6h2v6h2v-8H0zM12.667 7.334v10.666h2v-10.666h-2zM16.667 7.334v8h2v-6h2v6h2v-6h2v6h2v-8h-10z" />
              </svg>
            </a>
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-800" />
          
          {!loading && (
            <div className="flex items-center">
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
        </nav>
      </div>
    </header>
  );
}
