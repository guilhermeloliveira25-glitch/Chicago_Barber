"use client";

import { useMemo, useState } from "react";
import ServiceSelector from "@/components/services/serviceSelector";
import DateSelector from "@/components/booking/dateSelector";
import TimeSelector from "@/components/booking/timeSelector";
import { getAvailableTimes } from "@/components/booking/bookingUtils";
import type { BarberService } from "@/components/services/serviceCard";

export default function BookingPage() {
  const [selectedServices, setSelectedServices] = useState<BarberService[]>(
    [],
  );

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

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

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#F5F1E8]">
      <ServiceSelector
        selectedServices={selectedServices}
        onChange={(services) => {
          setSelectedServices(services);

          // Se a duração dos serviços mudar,
          // o horário anterior deixa de ser garantido.
          setSelectedTime("");
        }}
      />

      {selectedServices.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-red-500">
                Agendamento
              </p>

              <h2 className="mt-2 text-2xl font-black uppercase sm:text-3xl">
                Escolha seu horário
              </h2>
            </div>

            <div className="mt-6 border-y border-zinc-800 py-5">
              <p className="text-sm font-black uppercase tracking-widest text-zinc-500">
                Seu atendimento
              </p>

              <p className="mt-2 text-lg font-bold">
                {selectedServices
                  .map((service) => service.name)
                  .join(" + ")}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
                <span>R$ {totalPrice.toFixed(2)}</span>
                <span>•</span>
                <span>{totalDuration} min</span>
              </div>
            </div>

            <DateSelector
              selectedDate={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTime("");
              }}
            />

            {selectedDate && (
              <TimeSelector
                selectedTime={selectedTime}
                availableTimes={availableTimes}
                onChange={setSelectedTime}
              />
            )}

   {selectedDate && selectedTime && (
  <div className="mt-8 border border-red-500/40 bg-red-500/5 p-5">
    <p className="text-sm font-black uppercase tracking-widest text-red-500">
      Agendamento selecionado
    </p>

    <p className="mt-2 text-lg font-bold">
      {selectedDate} às {selectedTime}
    </p>

    <p className="mt-1 text-sm text-zinc-400">
      {totalDuration} minutos · R$ {totalPrice.toFixed(2)}
    </p>

    <button
      type="button"
      onClick={() => {
        console.log("Agendamento:", {
          services: selectedServices,
          date: selectedDate,
          time: selectedTime,
          duration: totalDuration,
          price: totalPrice,
        });
      }}
      className="mt-6 w-full bg-red-500 px-6 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-red-600"
    >
      Confirmar agendamento
    </button>
  </div>
)}
          </div>
        </section>
      )}
    </main>
  );
}