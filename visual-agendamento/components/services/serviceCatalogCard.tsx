import type { BarberService } from "./serviceCard";
import ServiceImage from "./serviceImage";
import { formatPrice, formatDuration } from "@/components/booking/bookingUtils";

type ServiceCatalogCardProps = {
  service: BarberService;
};

export default function ServiceCatalogCard({
  service,
}: ServiceCatalogCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-zinc-950/80 transition duration-200 hover:-translate-y-1 hover:border-[#FF5A00]">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <ServiceImage
          src={service.image}
          alt={service.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      <div className="relative p-5">
        <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-[#FF5A00] via-[#FF5A00]/30 to-transparent" />

        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-extrabold uppercase text-white">
            {service.name}
          </h2>

          <span className="whitespace-nowrap text-lg font-extrabold text-[#FF5A00]">
            {formatPrice(service.price)}
          </span>
        </div>

        <p className="mt-2 text-sm text-zinc-400">
          Aproximadamente {formatDuration(service.duration)}
        </p>
      </div>
    </article>
  );
}
