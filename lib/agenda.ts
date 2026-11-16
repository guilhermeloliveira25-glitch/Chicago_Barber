// Utilitários de datas, telefone e mensagens usados na home, no agendamento e na agenda do admin.

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

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function longDate(value: string): string {
  const text = parseDate(value).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return text.charAt(0).toUpperCase() + text.slice(1);
}

// ---------- Telefone ----------

// Deixa só os números e tira o 55 do começo, se vier junto
export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.length > 11 && digits.startsWith("55")) {
    digits = digits.slice(2);
  }

  return digits.slice(0, 11);
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

export function mailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ---------- Mensagens prontas para o cliente ----------

function greeting(name: string | null): string {
  const first = name?.trim().split(/\s+/)[0] ?? "";
  // quando o "nome" é só o e-mail, não usa
  const usable = first && !first.includes("@") ? first : "";

  return usable
    ? `Olá, ${usable}! Aqui é da Chicago Barber.`
    : "Olá! Aqui é da Chicago Barber.";
}

type Booking = { name: string | null; date: string; time: string };

export function messageAbout({ name, date, time }: Booking): string {
  return `${greeting(name)} Sobre o seu horário de ${longDate(date)} às ${time}: `;
}

export function messageCancelled(
  { name, date, time }: Booking,
  reason: string,
): string {
  const why = reason.trim() ? ` Motivo: ${reason.trim()}.` : "";

  return `${greeting(name)} Precisamos desmarcar o seu horário de ${longDate(date)} às ${time}.${why} Quer remarcar para outro dia ou horário?`;
}

export function messageRescheduled(
  { name }: { name: string | null },
  newDate: string,
  newTime: string,
): string {
  return `${greeting(name)} Seu horário foi remarcado para ${longDate(newDate)} às ${newTime}. Está tudo bem para você?`;
}
