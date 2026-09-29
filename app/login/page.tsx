"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/booking");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-[#F5F1E8]">
      <section className="mx-auto max-w-md">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
          Chicago Barber
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase">
          Entrar
        </h1>

        <p className="mt-3 text-zinc-400">
          Entre na sua conta para realizar seus agendamentos.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold uppercase tracking-wider text-zinc-400"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold uppercase tracking-wider text-zinc-400"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        {message && (
          <p className="mt-5 border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          Ainda não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-bold text-red-500 hover:text-red-400"
          >
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
}