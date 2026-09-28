"use client";

import { useMemo } from "react";
import ServiceCard, { type BarberService } from "./serviceCard";
import { SERVICES } from "./services";

type ServiceSelectorProps = {
  selectedServices: BarberService[];
  onChange: (services: BarberService[]) => void;
};

export default function ServiceSelector({
  selectedServices,
  onChange,
}: ServiceSelectorProps) {
  function toggleService(service: BarberService) {
    const alreadySelected = selectedServices.some(
      (item) => item.id === service.id,
    );

    if (alreadySelected) {
      onChange(
        selectedServices.filter(
          (item) => item.id !== service.id,
        ),
      );
    } else {
      onChange([...selectedServices, service]);
    }
  }

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

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-[#F5F1E8]">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-black uppercase tracking-widest text-red-500">
          Chicago Barber
        </p>

        <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
          Escolha seus serviços
        </h1>

        <p className="mt-4 max-w-xl text-zinc-400">
          Monte seu atendimento. O tempo total será usado para encontrar um
          horário que caiba na agenda.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={selectedServices.some(
                (item) => item.id === service.id,
              )}
              onToggle={toggleService}
            />
          ))}
        </div>

        <section className="mt-8 border border-zinc-800 bg-zinc-950 p-6">
          <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
            Resumo do atendimento
          </p>

          {selectedServices.length === 0 ? (
            <p className="mt-3 text-zinc-300">
              Nenhum serviço selecionado.
            </p>
          ) : (
            <>
              <p className="mt-3 text-lg font-bold">
                {selectedServices
                  .map((service) => service.name)
                  .join(" + ")}
              </p>

              <p className="mt-2 text-zinc-300">
                R$ {totalPrice.toFixed(2)} · {totalDuration} min
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}