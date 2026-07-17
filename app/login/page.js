"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLogin } from "@/lib/auth";
import { isDemoMode } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      router.replace("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent font-heading text-2xl font-bold text-primary">
            R
          </span>
          <h1 className="mt-3 font-heading text-2xl font-bold text-white">RideAO Admin</h1>
          <p className="text-sm text-white/50">Centro de operações</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-surface p-6 shadow-xl">
          <label className="block text-xs font-semibold text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@rideao.ao"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          <label className="mt-4 block text-xs font-semibold text-gray-600">Palavra-passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-accent"
          />
          {error && <p className="mt-3 text-xs font-medium text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-accent py-2.5 text-sm font-bold text-primary hover:bg-accent/90 disabled:opacity-60"
          >
            {loading ? "A entrar…" : "Entrar"}
          </button>
          {isDemoMode && (
            <p className="mt-4 rounded-lg bg-info-bg p-3 text-xs text-gray-600">
              <span className="font-semibold text-info">Modo demo</span> — admin@rideao.ao ·
              rideao123
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
