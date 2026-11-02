"use client";

import { useEffect, useState } from "react";
import ServiceCard, { type BarberService } from "./serviceCard";
import PageHeading from "@/components/ui/pageHeading";
import { fetchActiveServices } from "@/lib/services";

type ServiceSelectorProps = {
  selectedServices: BarberService[];
  onChange: (services: BarberService[]) => void;
};

export default function ServiceSelector({
  selectedServices,
  onChange,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<BarberService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    fetchActiveServices()
      .then((list) => {
        if (!active) return;
        setServices(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setError("Não foi possível carregar os serviços. Tente novamente.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function toggleService(service: BarberService) {
    const alreadySelected = selectedServices.some(
      (item) => item.id === service.id,
    );

    if (alreadySelected) {
      onChange(
        selectedServices.filter((item) => item.id !== service.id),
      );
    } else {
      onChange([...selectedServices, service]);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-6 py-8 sm:py-10">
      <PageHeading
        title="Escolha seus serviços"
        description="Monte seu atendimento. O tempo total será usado para encontrar um horário que caiba na agenda."
      />

      {loading && (
        <p className="mt-10 text-sm font-bold uppercase tracking-widest text-zinc-400">
          Carregando serviços...
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-10 border-l-4 border-[#DC2626] bg-black/40 p-4 text-sm text-zinc-200"
        >
          {error}
        </p>
      )}

      {!loading && !error && services.length === 0 && (
        <p className="mt-10 text-zinc-400">
          Nenhum serviço disponível no momento.
        </p>
      )}

      <div className="mt-10 grid items-start gap-4 sm:grid-cols-2">
        {services.map((service) => (
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
    </section>
  );
}
