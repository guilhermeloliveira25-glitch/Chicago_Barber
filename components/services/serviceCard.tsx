"use client";

import Image from "next/image";

export type BarberService = {
  id: string;
  name: string;
  price: number;
  duration: number;
  image?: string;
};

type ServiceCardProps = {
  service: BarberService;
  selected: boolean;
  onToggle: (service: BarberService) => void;
};

export default function ServiceCard({
  service,
  selected,
  onToggle,
}: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(service)}
      className={`group relative min-h-52 overflow-hidden border p-6 text-left transition hover:-translate-y-1 ${
        selected
          ? "border-red-500 bg-red-950"
          : "border-zinc-800 bg-zinc-950 hover:border-red-500 hover:bg-zinc-900"
      }`}
      aria-pressed={selected}
    >
      {service.image && (
        <>
          <Image
            src={service.image}
            alt={`Resultado de ${service.name}`}
            fill
            className="object-cover opacity-35 transition duration-300 group-hover:opacity-50"
          />
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}

      <div className="relative z-10 flex h-full flex-col justify-end">
        <span className="text-xl font-black uppercase tracking-wide">
          {service.name}
        </span>
        <span className="mt-2 text-sm text-zinc-300">
          R$ {service.price.toFixed(2)} · {service.duration} min
        </span>
        <span className="mt-5 text-xs font-bold uppercase tracking-widest text-red-400">
          {selected ? "Selecionado" : "Selecionar serviço"}
        </span>
      </div>
    </button>
  );
}
