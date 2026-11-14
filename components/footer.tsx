import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { marker } from "@/lib/fonts";

type SocialName = "instagram" | "whatsapp" | "tiktok" | "facebook";

function SocialIcon({ name }: { name: SocialName }) {
  const common = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...common}>
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
          <path d="M9 10c.5 1.5 2 3 3.5 3.5l1-1 2 1v1.5c0 .5-.5 1-1 1-4 0-7.5-3.5-7.5-7.5 0-.5.5-1 1-1H9l1 2z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );
  }
}

export default function Footer() {
  const socials: { name: SocialName; label: string; href: string }[] = [
    { name: "instagram", label: "Instagram", href: SITE.instagram },
    {
      name: "whatsapp",
      label: "WhatsApp",
      href: SITE.whatsapp ? `https://wa.me/55${SITE.whatsapp}` : "",
    },
    { name: "tiktok", label: "TikTok", href: SITE.tiktok },
    { name: "facebook", label: "Facebook", href: SITE.facebook },
  ];

  const links = socials.filter((social) => social.href);

  return (
    <footer className="relative border-t border-[#00D1FF]/40 bg-[#070707] shadow-[0_-10px_40px_-15px_rgba(0,209,255,0.45)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Link href="/" aria-label="Chicago Barber - página inicial">
            <Image
              src="/logo.png"
              alt="Chicago Barber"
              width={360}
              height={198}
              className="h-14 w-auto"
            />
          </Link>
          <p className={`${marker.className} text-lg text-[#00D1FF]`}>
            Cuide do seu estilo
          </p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <Link href="/services" className="transition hover:text-white">Serviços</Link>
          <Link href="/booking" className="transition hover:text-white">Agendamento</Link>
        </nav>

        {links.length > 0 && (
          <ul className="m-0 flex list-none items-center gap-3 p-0">
            {links.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-[#00D1FF] hover:text-[#00D1FF] hover:shadow-[0_0_18px_-4px_rgba(0,209,255,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
                >
                  <SocialIcon name={social.name} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-zinc-500">
        {SITE.name} © {new Date().getFullYear()}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
