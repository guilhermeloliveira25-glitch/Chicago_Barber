import Link from "next/link";
import ServiceImage from "@/components/services/serviceImage";
import { SITE, addressLine, mapsLink, instagramHandle } from "@/lib/site";
import { marker } from "@/lib/fonts";

function Row({ icon, children }: { icon: "pin" | "clock" | "phone" | "insta"; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-zinc-300">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="mt-0.5 h-5 w-5 shrink-0 text-[#00D1FF]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "pin" && (
          <>
            <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </>
        )}
        {icon === "clock" && (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </>
        )}
        {icon === "phone" && (
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
        )}
        {icon === "insta" && (
          <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
          </>
        )}
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default function Location() {
  const phone = SITE.phone || SITE.whatsapp;

  return (
    <section
      aria-labelledby="onde-estamos"
      className="mx-auto w-full max-w-6xl px-6 pb-20 sm:pb-28"
    >
      <div className="grid overflow-hidden rounded-lg border border-white/10 bg-zinc-950/85 backdrop-blur-md lg:grid-cols-2">
        <div className="relative aspect-[4/3] bg-zinc-900 lg:aspect-auto lg:min-h-[26rem]">
          <ServiceImage
            src={SITE.shopImage}
            alt={`Fachada da ${SITE.name}`}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="relative flex flex-col justify-center p-6 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#DC2626] lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1" />

          <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#EF4444]">
            Unidade
          </p>

          <h2
            id="onde-estamos"
            className={`${marker.className} mt-3 text-3xl leading-none text-white sm:text-5xl`}
          >
            {SITE.name}
          </h2>
          <div className="mt-4 h-1 w-24 -rotate-1 rounded-full bg-[#00D1FF]" />

          <ul className="m-0 mt-6 list-none space-y-3 p-0">
            <Row icon="pin">{addressLine()}</Row>
            <Row icon="clock">{SITE.hours}</Row>
            {phone && (
              <Row icon="phone">
                <a
                  href={`tel:+55${phone}`}
                  className="transition hover:text-[#00D1FF]"
                >
                  {phone.length === 11
                    ? `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
                    : phone.length === 10
                      ? `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`
                      : phone}
                </a>
              </Row>
            )}
            {SITE.instagram && (
              <Row icon="insta">
                <a
                  href={SITE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#00D1FF]"
                >
                  {instagramHandle()}
                </a>
              </Row>
            )}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/booking"
              className="bg-[#DC2626] px-6 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.8)] transition hover:bg-[#EF4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              Agendar horário
            </Link>
            <a
              href={mapsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-600 px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-zinc-200 transition hover:border-[#00D1FF] hover:text-[#00D1FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              Como chegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
