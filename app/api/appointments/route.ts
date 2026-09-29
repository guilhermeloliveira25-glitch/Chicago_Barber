import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const OPENING_TIME = 9 * 60;
const CLOSING_TIME = 19 * 60;
const CLOSED_DAYS = [0];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0",
  )}:00`;
}

function getDateInfo(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getTodayString(): string {
  const now = new Date();

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function getMaxDateString(): string {
  const today = new Date();

  const brazilDateString = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);

  const [year, month, day] = brazilDateString.split("-").map(Number);

  const maxDate = new Date(year, month - 1, day);
  maxDate.setMonth(maxDate.getMonth() + 1);

  return `${maxDate.getFullYear()}-${String(
    maxDate.getMonth() + 1,
  ).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;
}

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const accessToken = authorization.replace("Bearer ", "");

    const supabase = createClient(
      supabaseUrl,
      supabasePublishableKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Sessão inválida. Faça login novamente." },
        { status: 401 },
      );
    }

    const body = await request.json();

    const {
      serviceIds,
      date,
      time,
    }: {
      serviceIds: string[];
      date: string;
      time: string;
    } = body;

    if (
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0 ||
      !date ||
      !time
    ) {
      return NextResponse.json(
        { error: "Dados do agendamento incompletos." },
        { status: 400 },
      );
    }

    const today = getTodayString();
    const maxDate = getMaxDateString();

    if (date < today || date > maxDate) {
      return NextResponse.json(
        { error: "A data escolhida não é válida." },
        { status: 400 },
      );
    }

    const dateObject = getDateInfo(date);

    if (CLOSED_DAYS.includes(dateObject.getDay())) {
      return NextResponse.json(
        { error: "A barbearia não funciona nesta data." },
        { status: 400 },
      );
    }

    const startMinutes = timeToMinutes(time);

    if (
      Number.isNaN(startMinutes) ||
      startMinutes < OPENING_TIME ||
      startMinutes >= CLOSING_TIME
    ) {
      return NextResponse.json(
        { error: "O horário escolhido não é válido." },
        { status: 400 },
      );
    }

    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, price, duration")
      .in("slug", serviceIds);

    if (servicesError) {
      console.error(servicesError);

      return NextResponse.json(
        { error: "Não foi possível consultar os serviços." },
        { status: 500 },
      );
    }

    if (!services || services.length !== serviceIds.length) {
      return NextResponse.json(
        { error: "Um ou mais serviços não foram encontrados." },
        { status: 400 },
      );
    }

    const totalDuration = services.reduce(
      (total, service) => total + Number(service.duration),
      0,
    );

    const totalPrice = services.reduce(
      (total, service) => total + Number(service.price),
      0,
    );

    const endMinutes = startMinutes + totalDuration;

    if (endMinutes > CLOSING_TIME) {
      return NextResponse.json(
        {
          error:
            "Esse horário não permite concluir todos os serviços antes do fechamento.",
        },
        { status: 400 },
      );
    }

    if (date === today) {
      const now = new Date();

      const brazilTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).formatToParts(now);

      const currentHour = Number(
        brazilTime.find((part) => part.type === "hour")?.value,
      );

      const currentMinute = Number(
        brazilTime.find((part) => part.type === "minute")?.value,
      );

      const currentMinutes = currentHour * 60 + currentMinute;

      if (startMinutes <= currentMinutes) {
        return NextResponse.json(
          { error: "Esse horário já passou." },
          { status: 400 },
        );
      }
    }

    const startTime = minutesToTime(startMinutes);
    const endTime = minutesToTime(endMinutes);

    const { data: appointments, error: appointmentsError } =
      await supabase
        .from("appointments")
        .select("id, start_time, end_time, status")
        .eq("date", date)
        .neq("status", "cancelled");

    if (appointmentsError) {
      console.error(appointmentsError);

      return NextResponse.json(
        { error: "Não foi possível verificar os horários." },
        { status: 500 },
      );
    }

    const hasConflict = (appointments ?? []).some((appointment) => {
      const existingStart = timeToMinutes(appointment.start_time);
      const existingEnd = timeToMinutes(appointment.end_time);

      return (
        startMinutes < existingEnd &&
        endMinutes > existingStart
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        { error: "Esse horário já está ocupado." },
        { status: 409 },
      );
    }

    const { data: appointment, error: appointmentError } =
      await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          date,
          start_time: startTime,
          end_time: endTime,
          total_duration: totalDuration,
          total_price: totalPrice,
          status: "confirmed",
        })
        .select("id")
        .single();

    if (appointmentError || !appointment) {
      console.error(appointmentError);

      return NextResponse.json(
        { error: "Não foi possível criar o agendamento." },
        { status: 500 },
      );
    }

    const appointmentServices = services.map((service) => ({
      appointment_id: appointment.id,
      service_id: service.id,
      price: Number(service.price),
      duration: Number(service.duration),
    }));

    const { error: appointmentServicesError } = await supabase
      .from("appointment_services")
      .insert(appointmentServices);

    if (appointmentServicesError) {
      console.error(appointmentServicesError);

      await supabase
        .from("appointments")
        .delete()
        .eq("id", appointment.id);

      return NextResponse.json(
        { error: "Não foi possível salvar os serviços do agendamento." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      appointmentId: appointment.id,
      date,
      startTime,
      endTime,
      totalDuration,
      totalPrice,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno ao processar o agendamento." },
      { status: 500 },
    );
  }
}