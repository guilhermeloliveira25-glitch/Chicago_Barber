"use client";

import ServiceImage from "./serviceImage";
import { formatPrice, formatDuration } from "@/components/booking/bookingUtils";

export type BarberService = {
  id: string;
  name: string;
  price: number;
  duration: number;
  image: string;
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
      aria-pressed={selected}
      className={`group relative min-h-52 overflow-hidden rounded-lg border p-5 text-left transition duration-200 hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] ${
        selected
          ? "border-[#00D1FF] bg-zinc-950 shadow-[0_0_28px_-8px_rgba(0,209,255,0.55)]"
          : "border-white/10 bg-zinc-950 hover:border-[#FF5A00]"
      }`}
    >
      <ServiceImage
        src={service.image}
        alt={`Resultado de ${service.name}`}
        sizes="(max-width: 640px) 100vw, 50vw"
        className={`object-cover transition duration-300 ${
          selected ? "opacity-50" : "opacity-35 group-hover:opacity-50"
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

      {/* marca de selecionado */}
      <span
        aria-hidden
        className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold transition ${
          selected
            ? "scale-100 bg-[#00D1FF] text-black"
            : "scale-90 border border-white/20 text-transparent"
        }`}
      >
        ✓
      </span>

      <div className="relative z-10 flex h-full min-h-40 flex-col justify-end">
        <span className="text-xl font-extrabold uppercase tracking-wide text-white">
          {service.name}
        </span>

        <span className="mt-2 text-sm text-zinc-300">
          <span className="font-bold text-[#FF5A00]">
            {formatPrice(service.price)}
          </span>{" "}
          · {formatDuration(service.duration)}
        </span>

        <span
          className={`mt-4 text-xs font-bold uppercase tracking-widest ${
            selected ? "text-[#00D1FF]" : "text-zinc-400"
          }`}
        >
          {selected ? "Selecionado" : "Selecionar serviço"}
        </span>
      </div>
    </button>
  );
}
