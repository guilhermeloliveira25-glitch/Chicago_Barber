"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import GraffitiBackground from "@/components/ui/graffitiBackground";
import PageHeading from "@/components/ui/pageHeading";

type AppointmentService = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

type Appointment = {
  id: string;
  user_id: string;
  customer_email: string;
  customer_name: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  total_duration: number;
  total_price: number;
  status: "confirmed" | "cancelled" | "completed" | string;
  services: AppointmentService[];
};

type Notice = { type: "success" | "error"; text: string } | null;

const buttonClass =
  "rounded-md border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:border-[#00D1FF] hover:text-[#00D1FF] disabled:cursor-not-allowed disabled:opacity-40";

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function addDays(value: string, amount: number) {
  const date = dateFromString(value);
  date.setDate(date.getDate() + amount);
  return localDateString(date);
}

function startOfWeek(value: string) {
  const date = dateFromString(value);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return localDateString(date);
}

function formatLongDate(value: string) {
  return dateFromString(value).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value: string) {
  return dateFromString(value).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

function statusLabel(status: Appointment["status"]) {
  if (status === "cancelled") return "Cancelado";
  if (status === "completed") return "Concluído";
  return "Confirmado";
}

export default function AdminAgendaPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => localDateString(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const weekDates = useMemo(() => {
    const first = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(first, index));
  }, [selectedDate]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const start = startOfWeek(selectedDate);
      const end = addDays(start, 6);
      const response = await fetch(
        `/api/admin/appointments?start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" },
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível carregar a agenda.");
      }

      setAppointments(result.appointments ?? []);
    } catch (error) {
      console.error(error);
      setLoadError(error instanceof Error ? error.message : "Erro ao carregar a agenda.");
    } finally {
      setLoading(false);
    }
  }, [router, selectedDate]);

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");
      if (!active) return;

      if (error || data !== true) {
        router.replace("/");
        return;
      }

      setAllowed(true);
    }

    void checkAccess();
    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (allowed) void loadAppointments();
  }, [allowed, loadAppointments]);

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.appointment_date === selectedDate)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [appointments, selectedDate],
  );

  const activeAppointments = dayAppointments.filter((item) => item.status !== "cancelled");
  const cancelledCount = dayAppointments.filter((item) => item.status === "cancelled").length;
  const dayRevenue = activeAppointments.reduce((sum, item) => sum + Number(item.total_price || 0), 0);

  async function updateAppointment(
    appointment: Appointment,
    changes: { date?: string; time?: string; status?: "confirmed" | "cancelled" | "completed" },
  ) {
    setBusyId(appointment.id);
    setNotice(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: appointment.id, ...changes }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar o agendamento.");

      setNotice({
        type: "success",
        text: changes.status === "cancelled" ? "Agendamento cancelado." : "Agendamento atualizado.",
      });
      setEditing(null);
      await loadAppointments();
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao atualizar o agendamento.",
      });
    } finally {
      setBusyId(null);
    }
  }

  function openReschedule(appointment: Appointment) {
    setEditing(appointment);
    setEditDate(appointment.appointment_date);
    setEditTime(formatTime(appointment.start_time));
    setNotice(null);
  }

  if (!allowed) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
        <GraffitiBackground />
        <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">Verificando permissão...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      <GraffitiBackground />
      <main className="relative z-10 flex-1">
        <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-14">
          <PageHeading
            eyebrow="Painel do barbeiro"
            title="Agenda de cortes"
            description="Visualize os horários, acompanhe os clientes e gerencie os agendamentos."
          />

          {notice && (
            <p
              role="status"
              className={`mt-7 border-l-4 bg-black/50 p-4 text-sm text-zinc-200 ${
                notice.type === "success" ? "border-[#00D1FF]" : "border-[#DC2626]"
              }`}
            >
              {notice.text}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-lg border border-white/10 bg-zinc-950/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Semana selecionada</p>
              <p className="mt-1 text-lg font-extrabold capitalize text-white">{formatLongDate(selectedDate)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={buttonClass} onClick={() => setSelectedDate(addDays(selectedDate, -7))}>← Semana anterior</button>
              <button type="button" className={buttonClass} onClick={() => setSelectedDate(localDateString(new Date()))}>Hoje</button>
              <button type="button" className={buttonClass} onClick={() => setSelectedDate(addDays(selectedDate, 7))}>Próxima semana →</button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {weekDates.map((date) => {
              const count = appointments.filter((item) => item.appointment_date === date && item.status !== "cancelled").length;
              const selected = date === selectedDate;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`rounded-lg border p-3 text-left transition sm:p-4 ${
                    selected
                      ? "border-[#DC2626] bg-[#DC2626]/10 shadow-[0_8px_24px_-12px_rgba(220,38,38,0.8)]"
                      : "border-white/10 bg-zinc-950/70 hover:border-zinc-600"
                  }`}
                >
                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">{formatShortDate(date)}</span>
                  <span className={`mt-2 block text-xl font-black ${selected ? "text-white" : "text-zinc-200"}`}>{count}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{count === 1 ? "corte" : "cortes"}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-zinc-950/80 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Agendados</p>
              <p className="mt-1 text-2xl font-black text-white">{activeAppointments.length}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/80 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Cancelados</p>
              <p className="mt-1 text-2xl font-black text-zinc-400">{cancelledCount}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/80 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Valor previsto</p>
              <p className="mt-1 text-2xl font-black text-[#00D1FF]">{formatCurrency(dayRevenue)}</p>
            </div>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide text-white">Programação do dia</h2>
              <p className="mt-1 text-sm capitalize text-zinc-400">{formatLongDate(selectedDate)}</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="agenda-date" className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ir para</label>
              <input
                id="agenda-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-[#00D1FF]"
              />
              <button type="button" onClick={() => void loadAppointments()} className={buttonClass}>Atualizar</button>
            </div>
          </div>

          {loading && <p className="mt-6 text-sm text-zinc-400">Carregando agendamentos...</p>}
          {loadError && (
            <div role="alert" className="mt-6 border-l-4 border-[#DC2626] bg-black/50 p-4 text-sm text-zinc-200">
              {loadError}
              <p className="mt-2 text-xs text-zinc-400">Se a função de agenda ainda não existe no banco, execute a migração SQL enviada junto com estes arquivos.</p>
            </div>
          )}

          {!loading && !loadError && dayAppointments.length === 0 && (
            <div className="mt-5 rounded-lg border border-dashed border-zinc-700 bg-zinc-950/60 px-5 py-12 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-300">Nenhum corte neste dia</p>
              <p className="mt-2 text-sm text-zinc-500">Quando um cliente agendar, o horário aparecerá aqui.</p>
            </div>
          )}

          <div className="mt-5 space-y-3">
            {dayAppointments.map((appointment) => {
              const cancelled = appointment.status === "cancelled";
              return (
                <article key={appointment.id} className={`rounded-lg border bg-zinc-950/85 p-4 sm:p-5 ${cancelled ? "border-zinc-800 opacity-65" : "border-white/10"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex shrink-0 items-center gap-3 sm:w-36 sm:flex-col sm:items-start sm:gap-1 sm:border-r sm:border-white/10 sm:pr-4">
                      <span className="text-2xl font-black tabular-nums text-white">{formatTime(appointment.start_time)}</span>
                      <span className="text-xs text-zinc-500">até {formatTime(appointment.end_time)}</span>
                      <span className={`rounded border px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest ${cancelled ? "border-zinc-700 text-zinc-500" : appointment.status === "completed" ? "border-[#00D1FF]/40 text-[#00D1FF]" : "border-[#DC2626]/50 text-[#EF4444]"}`}>
                        {statusLabel(appointment.status)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-extrabold uppercase tracking-wide text-white">{appointment.customer_name}</h3>
                      <p className="mt-1 break-all text-xs text-zinc-500">{appointment.customer_email}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {appointment.services.map((service) => (
                          <span key={service.id} className="rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-zinc-300">{service.name}</span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-zinc-500">{appointment.total_duration} min <span className="px-1 text-zinc-700">·</span> <strong className="text-[#00D1FF]">{formatCurrency(appointment.total_price)}</strong></p>
                    </div>

                    {!cancelled && appointment.status !== "completed" && (
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <button type="button" className={buttonClass} onClick={() => openReschedule(appointment)}>Remarcar</button>
                        <button
                          type="button"
                          className="rounded-md border border-[#DC2626]/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#EF4444] transition hover:bg-[#DC2626]/10 disabled:opacity-40"
                          disabled={busyId === appointment.id}
                          onClick={() => {
                            if (window.confirm(`Cancelar o corte de ${appointment.customer_name} às ${formatTime(appointment.start_time)}?`)) {
                              void updateAppointment(appointment, { status: "cancelled" });
                            }
                          }}
                        >
                          {busyId === appointment.id ? "Salvando..." : "Cancelar"}
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {editing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="reschedule-title" className="w-full max-w-md border border-white/10 bg-[#111111] p-5 shadow-2xl sm:p-6">
                <div className="mb-5 h-1 w-full bg-[#DC2626]" />
                <h2 id="reschedule-title" className="text-lg font-black uppercase tracking-wide text-white">Remarcar corte</h2>
                <p className="mt-1 text-sm text-zinc-400">{editing.customer_name} · {formatTime(editing.start_time)}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Nova data
                    <input type="date" value={editDate} onChange={(event) => setEditDate(event.target.value)} className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-[#00D1FF]" />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Novo horário
                    <input type="time" value={editTime} onChange={(event) => setEditTime(event.target.value)} className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-white outline-none focus:border-[#00D1FF]" />
                  </label>
                </div>
                <p className="mt-3 text-xs text-zinc-500">A alteração só será salva se o horário estiver dentro do funcionamento e não houver conflito com outro corte.</p>
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <button type="button" className={buttonClass} onClick={() => setEditing(null)}>Voltar</button>
                  <button
                    type="button"
                    disabled={!editDate || !editTime || busyId === editing.id}
                    onClick={() => void updateAppointment(editing, { date: editDate, time: editTime })}
                    className="rounded-md bg-[#DC2626] px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#EF4444] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busyId === editing.id ? "Salvando..." : "Salvar remarcação"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
