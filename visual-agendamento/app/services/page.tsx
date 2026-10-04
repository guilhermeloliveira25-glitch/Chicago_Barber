import Link from "next/link";
import ServiceCatalogCard from "@/components/services/serviceCatalogCard";
import { SERVICES } from "@/components/services/services";
import GraffitiBackground from "@/components/ui/graffitiBackground";
import PageHeading from "@/components/ui/pageHeading";

export default function ServicesPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      <GraffitiBackground />

      <main className="relative z-10 flex-1">
        <section className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
          <div className="max-w-2xl">
            <PageHeading
              title="Nossos serviços"
              description="Conheça nossos serviços, escolha o que combina com você e cuide do seu visual com a Chicago Barber."
            />
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCatalogCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/booking"
              className="rounded-md bg-[#FF5A00] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(255,90,0,0.8)] transition hover:bg-[#ff6f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              Agendar horário
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
