"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setReady(true);

      if (!currentUser) {
        router.replace("/");
        return;
      }

      setUser(currentUser);
    });

    return () => unsub();
  }, [router]);

  const onLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  if (!ready || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 p-8">
        <h1 className="font-jetbrains text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-slate-300">Welcome, {user.displayName || user.email}</p>
        <p className="mt-6 text-slate-400">
          You are signed in. This is where you can show API key generation and usage analytics.
        </p>

        <button
          type="button"
          onClick={onLogout}
          className="mt-8 rounded-xl border border-slate-500 px-5 py-2 text-sm font-semibold transition hover:bg-slate-800"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
