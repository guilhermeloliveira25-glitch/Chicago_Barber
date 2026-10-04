"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Permanent_Marker } from "next/font/google";

const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

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
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
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
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      {/* ---------- Fundo: tinta laranja, textura e neon azul inferior ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* respingos de tinta laranja */}
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#FF5A00]/20 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-[#FF5A00]/10 blur-3xl" />

        {/* textura sutil de parede */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(#F5F5F5 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* iluminação urbana azul vinda de baixo */}
        <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-[#00D1FF]/25 via-[#00D1FF]/[0.07] to-transparent" />
        <div className="absolute -bottom-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[100%] bg-[#00D1FF]/30 blur-[110px]" />

        {/* silhueta de skyline */}
        <svg
          className="absolute inset-x-0 bottom-0 h-28 w-full text-[#06141c] sm:h-40"
          viewBox="0 0 1200 160"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          <path d="M0 160V110h40V70h30v40h30V90h26V50h34v60h24V80h40V30h28v50h30v30h36V60h30v50h40V90h26V40h36v70h30V70h40v40h34V50h30v60h30V80h40V20h30v60h26v30h40V90h36V60h30v50h34V80h40v30h30V70h34v40h40V90h30v70z" />
        </svg>

        {/* linha de neon no rodapé */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#00D1FF] shadow-[0_0_24px_6px_rgba(0,209,255,0.7)]" />
      </div>

    

      {/* ---------- Cadastro ---------- */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:py-16">
        <section className="relative w-full max-w-md">
          {/* coroa/tag em azul no canto, estilo grafite */}
          <svg
            aria-hidden
            className="absolute -left-3 -top-9 h-10 w-10 -rotate-12 text-[#00D1FF]"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 36 4 14l12 10 8-14 8 14 12-10-2 22z" />
            <path d="M8 42h32" />
          </svg>

          <div className="relative border border-white/10 bg-zinc-950/80 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-9">
            {/* faixa laranja no topo do cartão */}
            <div className="absolute inset-x-0 top-0 h-1 bg-[#FF5A00]" />

            {/* pingos de tinta escorrendo da faixa */}
            <div aria-hidden className="absolute left-8 top-1 flex items-start gap-6">
              <span className="block h-5 w-1.5 rounded-b-full bg-[#FF5A00]" />
              <span className="block h-3 w-1.5 rounded-b-full bg-[#FF5A00]" />
              <span className="block h-8 w-1.5 rounded-b-full bg-[#FF5A00]" />
            </div>

            <h1
              className={`${marker.className} mt-8 text-4xl leading-none text-white sm:text-5xl`}
            >
              Crie sua conta
            </h1>
            <div className="mt-3 h-1 w-24 -rotate-1 rounded-full bg-[#00D1FF]" />

            <p className="mt-5 text-zinc-400">
              Crie sua conta para realizar e acompanhar seus agendamentos.
            </p>

            <form onSubmit={handleCadastro} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-zinc-300"
                >
                  E-mail
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/30"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-zinc-300"
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
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/30"
                  placeholder="Mínimo de 8 caracteres"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#FF5A00] px-6 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(255,90,0,0.8)] transition hover:bg-[#ff6f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>
            </form>

            {message && (
              <p
                role="status"
                className="mt-5 border-l-4 border-[#00D1FF] bg-black/40 p-4 text-sm text-zinc-200"
              >
                {message}
              </p>
            )}

            <p className="mt-7 text-center text-sm text-zinc-500">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-bold text-[#00D1FF] underline-offset-4 transition hover:text-white hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="relative z-10 px-5 pb-6 pt-4 text-center">
        <p className={`${marker.className} text-lg text-[#00D1FF]`}>
          Cuide do seu estilo
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Chicago Barber © {new Date().getFullYear()}. Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
}
