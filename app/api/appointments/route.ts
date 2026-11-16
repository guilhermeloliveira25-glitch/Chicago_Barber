import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Mensagens da função create_appointment (banco) traduzidas para o cliente.
const ERRORS: Record<string, { message: string; status: number }> = {
  not_authenticated: { message: "Sessão inválida. Faça login novamente.", status: 401 },
  missing_contact: { message: "Informe seu nome e telefone antes de agendar.", status: 400 },
  invalid_request: { message: "Dados do agendamento incompletos.", status: 400 },
  service_not_found: { message: "Um ou mais serviços não foram encontrados.", status: 400 },
  invalid_date: { message: "A data escolhida não é válida.", status: 400 },
  closed_day: { message: "A barbearia não funciona nesta data.", status: 400 },
  invalid_time: {
    message: "Esse horário não permite concluir todos os serviços antes do fechamento.",
    status: 400,
  },
  past: { message: "Esse horário já passou.", status: 400 },
  slot_taken: { message: "Esse horário já está ocupado.", status: 409 },
};

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

    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

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

    const { serviceIds, date, time } = body as {
      serviceIds?: string[];
      date?: string;
      time?: string;
    };

    if (
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0 ||
      !date ||
      !time ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
    ) {
      return NextResponse.json(
        { error: "Dados do agendamento incompletos." },
        { status: 400 },
      );
    }

    // Toda a regra (data, domingo, expediente, horário que passou, conflito) e a
    // gravação acontecem dentro do banco, numa transação só.
    const { data, error } = await supabase.rpc("create_appointment", {
      p_service_slugs: serviceIds,
      p_date: date,
      p_start: `${time}:00`,
    });

    if (error) {
      const known = ERRORS[error.message.trim()];

      if (known) {
        return NextResponse.json({ error: known.message }, { status: known.status });
      }

      console.error(error);

      return NextResponse.json(
        { error: "Não foi possível criar o agendamento." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, ...(data as object) });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno ao processar o agendamento." },
      { status: 500 },
    );
  }
}
