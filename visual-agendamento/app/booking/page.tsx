"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ServiceSelector from "@/components/services/serviceSelector";
import DateSelector from "@/components/booking/dateSelector";
import TimeSelector from "@/components/booking/timeSelector";
import StepIndicator from "@/components/booking/stepIndicator";
import GraffitiBackground from "@/components/ui/graffitiBackground";
import {
  getAvailableTimes,
  formatPrice,
  formatDuration,
  formatDateLong,
} from "@/components/booking/bookingUtils";
import type { BarberService } from "@/components/services/serviceCard";
import { supabase } from "@/lib/supabase";

type Feedback = { type: "success" | "error"; text: string } | null;

export default function BookingPage() {
  const router = useRouter();

  const [selectedServices, setSelectedServices] = useState<BarberService[]>(
    [],
  );

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [checkingUser, setCheckingUser] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setCheckingUser(false);
    }

    checkUser();
  }, [router]);

  const totalDuration = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + service.duration,
        0,
      ),
    [selectedServices],
  );

  const totalPrice = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + service.price,
        0,
      ),
    [selectedServices],
  );

  const availableTimes = useMemo(
    () => getAvailableTimes(selectedDate, totalDuration),
    [selectedDate, totalDuration],
  );

  // Etapa atual do fluxo (só visual)
  const currentStep: 1 | 2 | 3 | 4 =
    selectedServices.length === 0
      ? 1
      : !selectedDate
        ? 2
        : !selectedTime
          ? 3
          : 4;

  async function handleConfirm() {
    setSubmitting(true);
    setFeedback(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          serviceIds: selectedServices.map((service) => service.id),
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFeedback({
          type: "error",
          text: result.error || "Não foi possível realizar o agendamento.",
        });
        return;
      }

      setFeedback({
        type: "success",
        text: `Agendamento confirmado para ${formatDateLong(
          selectedDate,
        )} às ${selectedTime}.`,
      });

      setSelectedServices([]);
      setSelectedDate("");
      setSelectedTime("");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);

      setFeedback({
        type: "error",
        text: "Ocorreu um erro ao realizar o agendamento.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function scrollToSchedule() {
    document
      .getElementById("horario")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (checkingUser) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
        <GraffitiBackground />
        <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Verificando sua conta...
          </p>
        </main>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  const showMobileBar = selectedServices.length > 0 && !selectedTime;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      <GraffitiBackground />

      <main
        className={`relative z-10 flex-1 ${showMobileBar ? "pb-28 sm:pb-0" : ""}`}
      >
        <div className="mx-auto max-w-5xl px-6 pt-8">
          <StepIndicator current={currentStep} />

          {feedback?.type === "success" && (
            <div
              role="status"
              className="mt-6 border-l-4 border-[#00D1FF] bg-black/50 p-5"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-[#00D1FF]">
                Tudo certo!
              </p>
              <p className="mt-1 text-zinc-200">{feedback.text}</p>
            </div>
          )}
        </div>

        <ServiceSelector
          selectedServices={selectedServices}
          onChange={(services) => {
            setSelectedServices(services);
            setFeedback(null);

            // Se a duração dos serviços mudar,
            // o horário anterior deixa de ser garantido.
            setSelectedTime("");
          }}
        />

        {selectedServices.length > 0 && (
          <section
            id="horario"
            className="mx-auto max-w-5xl scroll-mt-6 px-6 pb-20"
          >
            <div className="relative border border-white/10 bg-zinc-950/80 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-[#FF5A00]" />

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#FF5A00]">
                  Agendamento
                </p>

                <h2 className="mt-2 text-2xl font-extrabold uppercase text-white sm:text-3xl">
                  Escolha seu horário
                </h2>
              </div>

              <div className="mt-6 border-y border-white/10 py-5">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                  Seu atendimento
                </p>

                <p className="mt-2 text-lg font-bold text-white">
                  {selectedServices
                    .map((service) => service.name)
                    .join(" + ")}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                  <span className="font-bold text-[#FF5A00]">
                    {formatPrice(totalPrice)}
                  </span>
                  <span>•</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>

              <DateSelector
                selectedDate={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedTime("");
                  setFeedback(null);
                }}
              />

              {selectedDate && (
                <TimeSelector
                  selectedTime={selectedTime}
                  availableTimes={availableTimes}
                  onChange={(time) => {
                    setSelectedTime(time);
                    setFeedback(null);
                  }}
                />
              )}

              {selectedDate && selectedTime && (
                <div className="mt-8 border border-[#FF5A00]/40 bg-[#FF5A00]/5 p-5">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#FF5A00]">
                    Agendamento selecionado
                  </p>

                  <p className="mt-2 text-lg font-bold capitalize text-white">
                    {formatDateLong(selectedDate)}{" "}
                    <span className="normal-case">às {selectedTime}</span>
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    {formatDuration(totalDuration)} ·{" "}
                    {formatPrice(totalPrice)}
                  </p>

                  {feedback?.type === "error" && (
                    <p
                      role="alert"
                      className="mt-4 border-l-4 border-[#FF5A00] bg-black/40 p-3 text-sm text-zinc-200"
                    >
                      {feedback.text}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="mt-6 w-full rounded-md bg-[#FF5A00] px-6 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(255,90,0,0.8)] transition hover:bg-[#ff6f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Agendando..." : "Confirmar agendamento"}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Resumo fixo no celular enquanto escolhe os serviços */}
      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#00D1FF]/40 bg-[#0B0B0B]/95 px-4 py-3 shadow-[0_-10px_30px_-10px_rgba(0,209,255,0.35)] backdrop-blur sm:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wider text-zinc-400">
                {selectedServices.length}{" "}
                {selectedServices.length === 1 ? "serviço" : "serviços"} ·{" "}
                {formatDuration(totalDuration)}
              </p>
              <p className="text-lg font-extrabold text-[#FF5A00]">
                {formatPrice(totalPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToSchedule}
              className="shrink-0 rounded-md bg-[#FF5A00] px-5 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:bg-[#ff6f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              Escolher horário
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
