"use client";

import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loginError, setLoginError] = useState("");

  const checkAdminAuth = async () => {
    try {
      const res = await fetch("/api/admin/verify");
      if (res.ok) {
        setIsAdmin(true);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);

      const ordersRes = await fetch("/api/admin/orders");
      const ordersData = await ordersRes.json();
      if (ordersData.success) setOrders(ordersData.orders);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const onGoogleLogin = async () => {
    setLoginError("");
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const email = credential.user.email?.trim().toLowerCase();
      const name = credential.user.displayName?.trim();

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Admin login failed");
      }

      setIsAdmin(true);
      fetchData();
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, updates: any) => {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, ...updates }),
    });
    if (res.ok) fetchData();
  };

  const updateOrder = async (id: string, updates: any) => {
    const res = await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id, ...updates }),
    });
    if (res.ok) fetchData();
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-800 p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
          {loginError && <p className="text-red-400 text-sm mb-4">{loginError}</p>}
          <button
            onClick={onGoogleLogin}
            className="w-full rounded bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
          >
            Login with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Name</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Active</th>
                <th className="p-3">Usage</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-700">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">
                    <select 
                      value={u.plan} 
                      onChange={(e) => updateUser(u._id, { plan: e.target.value })}
                      className="bg-slate-900 border border-slate-600 rounded p-1"
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="enterprise">enterprise</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={u.active} 
                      onChange={(e) => updateUser(u._id, { active: e.target.checked })}
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="number" 
                      value={u.usage || 0}
                      onChange={(e) => updateUser(u._id, { usage: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-600 rounded p-1 w-16"
                    />
                    / 
                    <input 
                      type="number" 
                      value={u.limit || 0}
                      onChange={(e) => updateUser(u._id, { limit: Number(e.target.value) })}
                      className="bg-slate-900 border border-slate-600 rounded p-1 w-16 ml-1"
                    />
                  </td>
                  <td className="p-3 text-slate-400 font-mono text-xs max-w-[150px] truncate" title={u.apiKey}>
                    {u.apiKey}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Orders ({orders.length})</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Credited</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t border-slate-700">
                  <td className="p-3 font-mono text-xs">{o.orderId}</td>
                  <td className="p-3">{o.userId?.email || 'N/A'}</td>
                  <td className="p-3">{o.amount} {o.currency}</td>
                  <td className="p-3">
                    <select 
                      value={o.status || 'created'} 
                      onChange={(e) => updateOrder(o._id, { status: e.target.value })}
                      className="bg-slate-900 border border-slate-600 rounded p-1"
                    >
                      <option value="created">created</option>
                      <option value="active">active</option>
                      <option value="paid">paid</option>
                      <option value="failed">failed</option>
                      <option value="cancelled">cancelled</option>
                      <option value="expired">expired</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={o.credited} 
                      onChange={(e) => updateOrder(o._id, { credited: e.target.checked })}
                    />
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => alert(JSON.stringify(o, null, 2))}
                      className="text-blue-400 hover:underline"
                    >
                      View All
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
