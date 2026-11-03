import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

async function getAuthenticatedClient(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { client: null, error: "Usuário não autenticado.", status: 401 };
  }

  const accessToken = authorization.slice("Bearer ".length);
  const client = createClient(supabaseUrl, supabasePublishableKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser(accessToken);

  if (error || !user) {
    return {
      client: null,
      error: "Sessão inválida. Faça login novamente.",
      status: 401,
    };
  }

  return { client, error: null, status: 200 };
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if (!auth.client) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  if (!startDate || !endDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return NextResponse.json({ error: "Informe um intervalo de datas válido." }, { status: 400 });
  }

  const { data, error } = await auth.client.rpc("admin_list_appointments", {
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    console.error("Erro ao carregar agenda:", error);
    const status = error.code === "42501" ? 403 : 500;
    return NextResponse.json(
      { error: status === 403 ? "Apenas administradores podem acessar a agenda." : "Não foi possível carregar os agendamentos. Confira se a migração da agenda foi executada." },
      { status },
    );
  }

  return NextResponse.json({ appointments: data ?? [] });
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedClient(request);
  if (!auth.client) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: {
    id?: string;
    date?: string;
    time?: string;
    status?: "confirmed" | "cancelled" | "completed";
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da solicitação inválido." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Agendamento não informado." }, { status: 400 });
  }

  if (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }

  if (body.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.time)) {
    return NextResponse.json({ error: "Horário inválido." }, { status: 400 });
  }

  if (!body.status && (!body.date || !body.time)) {
    return NextResponse.json({ error: "Informe o novo status ou a nova data e horário." }, { status: 400 });
  }

  const { error } = await auth.client.rpc("admin_update_appointment", {
    p_appointment_id: body.id,
    p_date: body.date ?? null,
    p_start_time: body.time ? `${body.time}:00` : null,
    p_status: body.status ?? null,
  });

  if (error) {
    console.error("Erro ao atualizar agendamento:", error);
    const status = error.code === "42501" ? 403 : error.code === "P0002" ? 404 : 400;
    return NextResponse.json({ error: error.message || "Não foi possível atualizar o agendamento." }, { status });
  }

  return NextResponse.json({ success: true });
}
