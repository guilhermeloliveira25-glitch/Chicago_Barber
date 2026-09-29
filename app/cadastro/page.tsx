"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      "Cadastro realizado. Verifique seu e-mail para confirmar a conta.",
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-[#F5F1E8]">
      <section className="mx-auto max-w-md">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
          Chicago Barber
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase">
          Criar conta
        </h1>

        <p className="mt-3 text-zinc-400">
          Crie sua conta para realizar e acompanhar seus agendamentos.
        </p>

        <form onSubmit={handleCadastro} className="mt-8 space-y-5">
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
              minLength={8}
              className="mt-2 w-full border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500"
              placeholder="Mínimo de 8 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        {message && (
          <p className="mt-5 border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-zinc-500">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-bold text-red-500 hover:text-red-400"
          >
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}