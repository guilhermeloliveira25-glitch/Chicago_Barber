"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toDateString, addDays, parseDate } from "@/lib/agenda";
import { formatPrice } from "@/components/booking/bookingUtils";

type UpcomingItem = {
  id: string;
  date: string;
  start: string;
  end: string;
  price: number;
  cancelled: boolean;
  services: string[];
};

type State =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "ready"; items: UpcomingItem[] };

function dayLabel(date: string): string {
  const today = toDateString(new Date());

  if (date === today) return "Hoje";
  if (date === addDays(today, 1)) return "Amanhã";

  return parseDate(date).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function shortTime(value: string): string {
  return String(value).slice(0, 5);
}

async function loadUpcoming(): Promise<UpcomingItem[]> {
  const now = new Date();
  const today = toDateString(now);
  const nowTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  // A regra de segurança do banco já devolve só os agendamentos do próprio usuário.
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select("id, date, start_time, end_time, total_price, status")
    .gte("date", today)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(8);

  if (error || !appointments) {
    throw error ?? new Error("Sem dados");
  }

  const upcoming = appointments.filter(
    (item) => !(item.date === today && shortTime(item.end_time) <= nowTime),
  );

  if (upcoming.length === 0) {
    return [];
  }

  // Nomes dos serviços de cada agendamento
  const ids = upcoming.map((item) => item.id);

  const { data: links } = await supabase
    .from("appointment_services")
    .select("appointment_id, service_id")
    .in("appointment_id", ids);

  const serviceIds = Array.from(new Set((links ?? []).map((link) => link.service_id)));

  const { data: services } = serviceIds.length
    ? await supabase.from("services").select("id, name").in("id", serviceIds)
    : { data: [] as { id: string; name: string }[] };

  const nameById = new Map((services ?? []).map((service) => [String(service.id), service.name]));

  return upcoming.map((item) => ({
    id: String(item.id),
    date: item.date,
    start: shortTime(item.start_time),
    end: shortTime(item.end_time),
    price: Number(item.total_price),
    cancelled: String(item.status) === "cancelled",
    services: (links ?? [])
      .filter((link) => String(link.appointment_id) === String(item.id))
      .map((link) => nameById.get(String(link.service_id)))
      .filter((name): name is string => Boolean(name)),
  }));
}

export default function MyAppointments() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        setState({ status: "anon" });
        return;
      }

      try {
        const items = await loadUpcoming();
        if (active) setState({ status: "ready", items });
      } catch (error) {
        console.error(error);
        if (active) setState({ status: "anon" }); // se falhar, o card simplesmente não aparece
      }
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && active) {
        setState({ status: "anon" });
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (state.status !== "ready") {
    return null;
  }

  const visible = state.items.slice(0, 3);

  return (
    <section
      aria-labelledby="meus-agendamentos"
      className="relative w-full max-w-md overflow-hidden border border-white/10 bg-zinc-950/85 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#DC2626]" />

      <h2
        id="meus-agendamentos"
        className="text-sm font-bold uppercase tracking-[0.2em] text-[#00D1FF]"
      >
        Seus agendamentos
      </h2>

      {visible.length === 0 ? (
        <div className="mt-4">
          <p className="text-zinc-300">Você não tem horários marcados.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Escolha o serviço e o melhor horário para você.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((item) => {
            const date = parseDate(item.date);

            return (
              <li
                key={item.id}
                className={`flex gap-4 border border-white/10 bg-black/40 p-3 ${
                  item.cancelled ? "opacity-60" : ""
                }`}
              >
                <div className="flex w-14 shrink-0 flex-col items-center justify-center border-r border-white/10 pr-3 text-center">
                  <span className="text-2xl font-extrabold leading-none text-white">
                    {date.getDate()}
                  </span>
                  <span className="mt-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                    <span className="capitalize">{dayLabel(item.date)}</span>
                    <span className="text-zinc-400">·</span>
                    <span>
                      {item.start} às {item.end}
                    </span>
                    {item.cancelled && (
                      <span className="rounded border border-[#EF4444]/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                        Cancelado
                      </span>
                    )}
                  </p>

                  <p className="mt-1 truncate text-sm text-zinc-400">
                    {item.services.length > 0 ? item.services.join(" + ") : "Atendimento"}
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#EF4444]">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {state.items.length > visible.length && (
        <p className="mt-3 text-xs text-zinc-500">
          + {state.items.length - visible.length} agendamento(s) mais à frente
        </p>
      )}

      <Link
        href="/booking"
        className="mt-5 block w-full bg-[#DC2626] px-5 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.8)] transition hover:bg-[#EF4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
      >
        {visible.length === 0 ? "Agendar agora" : "Novo agendamento"}
      </Link>
    </section>
  );
}
