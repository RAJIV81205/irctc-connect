"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Train, ChevronRight, LogOut } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <Train className="h-5 w-5" />
          </div>
          <span className="font-jetbrains font-bold text-slate-100 tracking-tight">irctc-connect</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/docs" className="text-sm font-medium text-slate-400 transition hover:text-slate-100">
            Documentation
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-400 transition hover:text-slate-100">
            Pricing
          </Link>
          
          <div className="hidden sm:block h-5 w-px bg-slate-800" />
          
          {!loading && (
            <div className="hidden sm:flex items-center">
              {user ? (
                pathname === "/dashboard" ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
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
