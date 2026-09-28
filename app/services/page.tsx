import ServiceCatalogCard from "@/components/services/serviceCatalogCard";
import { SERVICES } from "@/components/services/services";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-[#F5F1E8]">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-red-500">
            Chicago Barber
          </p>

          <h1 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Nossos serviços
          </h1>

          <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
            Conheça nossos serviços, escolha o que combina com você
            e cuide do seu visual com a Chicago Barber.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <ServiceCatalogCard
              key={service.id}
              service={service}
            />
          ))}
        </div>
      </section>
    </main>
  );
}