import Link from "next/link";
import ServiceCatalogCard from "@/components/services/serviceCatalogCard";
import GraffitiBackground from "@/components/ui/graffitiBackground";
import PageHeading from "@/components/ui/pageHeading";
import { fetchActiveServices } from "@/lib/services";
import type { BarberService } from "@/components/services/serviceCard";

// Sempre busca os dados na hora: quando o admin muda algo, o site já reflete.
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  let services: BarberService[] = [];
  let failed = false;

  try {
    services = await fetchActiveServices();
  } catch (error) {
    console.error(error);
    failed = true;
  }

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

          {failed && (
            <p
              role="alert"
              className="mt-12 border-l-4 border-[#DC2626] bg-black/40 p-4 text-sm text-zinc-200"
            >
              Não foi possível carregar os serviços agora. Tente novamente em
              instantes.
            </p>
          )}

          {!failed && services.length === 0 && (
            <p className="mt-12 text-zinc-400">
              Em breve teremos novidades por aqui.
            </p>
          )}

          <div className="mt-12 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCatalogCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <Link
              href="/booking"
              className="rounded-md bg-[#DC2626] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.8)] transition hover:bg-[#EF4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              Agendar horário
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
