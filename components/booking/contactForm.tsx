"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { formatPhone, isValidPhone, normalizePhone } from "@/lib/agenda";

export type ClientDetails = {
  full_name: string;
  phone: string; // só números
};

type ContactFormProps = {
  userId: string;
  initial: ClientDetails | null;
  onSaved: (details: ClientDetails) => void;
  onCancel?: () => void;
};

const inputClass =
  "mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/30";

export default function ContactForm({
  userId,
  initial,
  onSaved,
  onCancel,
}: ContactFormProps) {
  const [name, setName] = useState(initial?.full_name ?? "");
  const [phone, setPhone] = useState(initial ? formatPhone(initial.phone) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const fullName = name.trim().replace(/\s+/g, " ");
    const digits = normalizePhone(phone);

    if (fullName.length < 2) {
      setError("Informe seu nome.");
      return;
    }

    if (!isValidPhone(digits)) {
      setError("Informe um telefone com DDD, por exemplo (11) 91234-5678.");
      return;
    }

    setSaving(true);

    const { error: saveError } = await supabase.from("client_details").upsert(
      {
        user_id: userId,
        full_name: fullName,
        phone: digits,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    setSaving(false);

    if (saveError) {
      console.error(saveError);
      setError("Não foi possível salvar seus dados. Tente novamente.");
      return;
    }

    onSaved({ full_name: fullName, phone: digits });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 border border-white/10 bg-black/30 p-5"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
        Seus dados de contato
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        Usamos só para avisar você caso o horário precise mudar.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="block text-sm font-semibold text-zinc-300">
            Nome
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={80}
            autoComplete="name"
            className={inputClass}
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="block text-sm font-semibold text-zinc-300">
            Telefone / WhatsApp
          </label>
          <input
            id="contact-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            onBlur={() => {
              const digits = normalizePhone(phone);
              if (digits) setPhone(formatPhone(digits));
            }}
            required
            inputMode="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="(11) 91234-5678"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 border-l-4 border-[#DC2626] bg-black/40 p-3 text-sm text-zinc-200">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#DC2626] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#EF4444] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar contato"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-md border border-zinc-700 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-300 transition hover:border-[#00D1FF] hover:text-[#00D1FF] disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
