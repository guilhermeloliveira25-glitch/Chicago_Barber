import Image from "next/image";
import type { BarberService } from "./serviceCard";

type ServiceCatalogCardProps = {
  service: BarberService;
};

export default function ServiceCatalogCard({
  service,
}: ServiceCatalogCardProps) {
  return (
    <article className="group overflow-hidden border border-zinc-800 bg-zinc-950">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <Image
          src={service.image}
          alt={service.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-black uppercase">
            {service.name}
          </h2>

          <span className="whitespace-nowrap text-lg font-black text-red-500">
            R$ {service.price.toFixed(2)}
          </span>
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          Aproximadamente {service.duration} min
        </p>
      </div>
    </article>
  );
}