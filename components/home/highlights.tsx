"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { marker } from "@/lib/fonts";

// Edite aqui os cartões que ficam passando na home.
const SLIDES = [
  {
    src: "/images/chicago-barber-foto-06.jpg",
    position: "50% 30%",
    title: "Cortes com identidade",
    text: "Cada cabelo pede um estilo. Venha achar o seu.",
    cta: { label: "Ver serviços", href: "/services" },
  },
  {
    src: "/images/chicago-barber-foto-03.jpg",
    position: "50% 25%",
    title: "Seu estilo, do seu jeito",
    text: "Escolha o serviço, o dia e o horário em poucos cliques.",
    cta: { label: "Agendar horário", href: "/booking" },
  },
  {
    src: "/images/chicago-barber-foto-04.jpg",
    position: "50% 35%",
    title: "Barba bem cuidada",
    text: "Alinhamento, acabamento e todo o cuidado que ela merece.",
    cta: { label: "Ver serviços", href: "/services" },
  },
  {
    src: "/images/chicago-barber-foto-02.jpg",
    position: "50% 22%",
    title: "Cor e transformação",
    text: "Coloração, hidratação e progressiva para mudar o visual.",
    cta: { label: "Conhecer", href: "/services" },
  },
  {
    src: "/images/chicago-barber-foto-07.jpg",
    position: "50% 40%",
    title: "Detalhes que fazem diferença",
    text: "Acabamento e desenhos feitos na régua.",
    cta: { label: "Agendar horário", href: "/booking" },
  },
];

const INTERVAL_MS = 6000;

export default function Highlights() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  // Passa sozinho, exceto com mouse/foco em cima, botão de pausa ou "reduzir movimento"
  useEffect(() => {
    if (paused || userPaused) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [paused, userPaused, index]);

  function go(next: number) {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da barbearia"
      className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#EF4444]">
          Chicago Barber
        </p>
        <h2 className={`${marker.className} mt-3 text-3xl leading-none text-white sm:text-5xl`}>
          Estilo é atitude
        </h2>
        <div className="mt-4 h-1 w-24 -rotate-1 rounded-full bg-[#00D1FF]" />
      </div>

      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 sm:aspect-[16/9]">
        {SLIDES.map((slide, slideIndex) => {
          const active = slideIndex === index;

          return (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} de ${SLIDES.length}`}
              aria-hidden={!active}
              inert={!active}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
                active ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.src}
                alt=""
                fill
                sizes="(min-width: 1152px) 1100px, 100vw"
                className="object-cover"
                style={{ objectPosition: slide.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 pb-16 sm:p-10 sm:pb-16">
                <h3 className="max-w-md text-2xl font-extrabold uppercase leading-tight text-white sm:text-4xl">
                  {slide.title}
                </h3>
                <p className="mt-2 max-w-md text-zinc-200">{slide.text}</p>
                <Link
                  href={slide.cta.href}
                  className="mt-5 inline-block bg-[#DC2626] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.8)] transition hover:bg-[#EF4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
                >
                  {slide.cta.label}
                </Link>
              </div>
            </div>
          );
        })}

        {/* controles */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 px-6 pb-5 sm:px-10">
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, dotIndex) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(dotIndex)}
                aria-label={`Ir para o destaque ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] ${
                  dotIndex === index ? "w-8 bg-[#DC2626]" : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUserPaused((current) => !current)}
              aria-label={userPaused ? "Retomar apresentação automática" : "Pausar apresentação automática"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition hover:border-[#00D1FF] hover:text-[#00D1FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                {userPaused ? <path d="M8 5v14l11-7z" /> : <path d="M7 5h4v14H7zM13 5h4v14h-4z" />}
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Destaque anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition hover:border-[#00D1FF] hover:text-[#00D1FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Próximo destaque"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white transition hover:border-[#00D1FF] hover:text-[#00D1FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
