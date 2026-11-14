import { supabase } from "@/lib/supabase";

// ---------- Tipos ----------

export type AgendaItem = {
  appointment_id: string;
  appt_date: string; // YYYY-MM-DD
  starts_at: string; // HH:MM
  ends_at: string; // HH:MM
  duration_minutes: number;
  price_total: number;
  appt_status: string;
  cancel_reason: string | null;
  client_name: string | null;
  client_phone: string | null; // só números, sem +55
  client_email: string | null;
  service_names: string[];
};

export type ClientDetails = {
  full_name: string;
  phone: string;
};

// ---------- Datas (sempre texto YYYY-MM-DD, no fuso do navegador) ----------

export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(value: string, days: number): string {
  const date = parseDate(value);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// Segunda-feira da semana da data informada
export function weekStart(value: string): string {
  const date = parseDate(value);
  const offset = (date.getDay() + 6) % 7;
  return addDays(value, -offset);
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// ---------- Telefone ----------

// Deixa só os números e tira o 55 do começo, se vier junto
export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  return digits;
}

export function isValidPhone(value: string): boolean {
  return /^[0-9]{10,11}$/.test(value);
}

export function formatPhone(digits: string): string {
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return digits;
}

export function whatsappLink(phone: string, message: string): string {
  return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
}

// ---------- Mensagens prontas para o cliente ----------

export function firstName(fullName: string | null): string {
  return fullName?.trim().split(/\s+/)[0] || "";
}

function greeting(name: string | null): string {
  const first = firstName(name);
  return first ? `Olá, ${first}! Aqui é da Chicago Barber.` : "Olá! Aqui é da Chicago Barber.";
}

export function longDate(value: string): string {
  const text = parseDate(value).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function messageAbout(item: AgendaItem): string {
  return `${greeting(item.client_name)} Sobre o seu horário de ${longDate(item.appt_date)} às ${item.starts_at}: `;
}

export function messageCancelled(item: AgendaItem, reason: string): string {
  const why = reason.trim() ? ` Motivo: ${reason.trim()}.` : "";

  return `${greeting(item.client_name)} Precisamos desmarcar o seu horário de ${longDate(item.appt_date)} às ${item.starts_at}.${why} Quer remarcar para outro dia ou horário?`;
}

export function messageRescheduled(
  item: AgendaItem,
  newDate: string,
  newTime: string,
): string {
  return `${greeting(item.client_name)} Seu horário foi remarcado para ${longDate(newDate)} às ${newTime}. Está tudo bem para você?`;
}

// ---------- Chamadas ao banco ----------

export async function fetchAgenda(from: string, to: string): Promise<AgendaItem[]> {
  const { data, error } = await supabase.rpc("admin_list_appointments", {
    p_from: from,
    p_to: to,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as AgendaItem[]).map((item) => ({
    ...item,
    duration_minutes: Number(item.duration_minutes),
    price_total: Number(item.price_total),
  }));
}

const ERROR_TEXT: Record<string, string> = {
  forbidden: "Você não tem permissão para fazer isso.",
  not_found: "Esse agendamento não está mais ativo. Atualize a página.",
  slot_taken: "Esse horário já está ocupado.",
  past: "Esse horário já passou.",
  invalid_date: "A data escolhida não é válida.",
  closed_day: "Não abrimos aos domingos.",
  invalid_time: "O atendimento não cabe nesse horário (funcionamos das 9h às 19h).",
};

export function friendlyError(message: string | undefined): string {
  const key = (message ?? "").trim();
  return ERROR_TEXT[key] ?? "Não foi possível concluir. Tente novamente.";
}

export async function cancelAppointment(id: string, reason: string) {
  const { error } = await supabase.rpc("admin_cancel_appointment", {
    p_id: id,
    p_reason: reason.trim() || null,
  });

  return error ? friendlyError(error.message) : null;
}

export async function rescheduleAppointment(
  id: string,
  date: string,
  startTime: string,
) {
  const { error } = await supabase.rpc("admin_reschedule_appointment", {
    p_id: id,
    p_date: date,
    p_start: startTime,
  });

  return error ? friendlyError(error.message) : null;
}
