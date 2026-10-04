"use client";

import ServiceCard, { type BarberService } from "./serviceCard";
import { SERVICES } from "./services";
import PageHeading from "@/components/ui/pageHeading";

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
    </section>
  );
}
