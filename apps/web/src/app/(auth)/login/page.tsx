"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("director@buildflow.id");
  const [password, setPassword] = useState("Password123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    { role: "Direktur Utama", email: "director@buildflow.id", badge: "Executive" },
    { role: "Project Manager", email: "pm@buildflow.id", badge: "Operasional" },
    { role: "Finance Manager", email: "finance@buildflow.id", badge: "Finance" },
    { role: "Site Supervisor", email: "site@buildflow.id", badge: "Lapangan" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal masuk ke sistem");
      }

      // Store auth session
      if (typeof window !== "undefined") {
        localStorage.setItem("buildflow_token", data.accessToken);
        localStorage.setItem("buildflow_user", JSON.stringify(data.user));
      }

      router.push("/overview");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  const selectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#17324D] text-white flex items-center justify-center font-bold text-2xl shadow-md tracking-wider">
            BF
          </div>
          <span className="font-bold text-2xl text-[#17324D] tracking-tight">BUILDFlow ERP</span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-[#0F172A]">
          Sistem Informasi Manajemen Konstruksi
        </h2>
        <p className="mt-1 text-center text-sm text-[#64748B]">
          PT Maju Konstruksi Perkasa — Portal Akses Terpadu
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 sm:rounded-xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Korporat
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#2F6B9A] focus:outline-none focus:ring-1 focus:ring-[#2F6B9A] text-sm"
                  placeholder="nama@perusahaan.co.id"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Kata Sandi
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#2F6B9A] focus:outline-none focus:ring-1 focus:ring-[#2F6B9A] text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#2F6B9A] focus:ring-[#2F6B9A]" />
                <span className="ml-2">Ingat sesi saya</span>
              </label>
              <span className="text-[#2F6B9A] hover:underline cursor-pointer">Lupa kata sandi?</span>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-lg bg-[#2F6B9A] py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#25567b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6B9A] transition-colors disabled:opacity-50"
              >
                {loading ? "Memverifikasi..." : "Masuk ke Sistem"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-xs font-medium text-slate-500 mb-2.5">Demo Akses Cepat (Role Blueprint):</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectDemo(acc.email)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all ${
                    email === acc.email
                      ? "border-[#2F6B9A] bg-blue-50/50 text-[#17324D] font-semibold"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{acc.role}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                      {acc.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Enkripsi AES-256 GCM • Multi-Tenant Enterprise Tier
        </p>
      </div>
    </div>
  );
}

