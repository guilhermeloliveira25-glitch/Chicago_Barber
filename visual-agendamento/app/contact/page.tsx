import Image from "next/image";
import { marker } from "@/lib/fonts";

// Para trocar o vídeo, altere só esta linha (arquivos em /public/videos).
const VIDEO_SRC = "/videos/chicago-barber-video-03.mp4";
const POSTER_SRC = "/images/chicago-barber-foto-02.jpg";
const INSTAGRAM_URL = "https://www.instagram.com/gui_gold_barber/";

export default function Contact() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      {/* Foto de fundo: aparece enquanto o vídeo carrega e para quem
          prefere menos movimento (o vídeo é escondido nesse caso). */}
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/70" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] bg-[#00D1FF] shadow-[0_0_24px_6px_rgba(0,209,255,0.7)]"
      />

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="relative w-full max-w-md border border-white/10 bg-zinc-950/80 p-8 text-center shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[#FF5A00]" />

          <h1
            className={`${marker.className} text-4xl leading-none text-white sm:text-5xl`}
          >
            Entre em contato
          </h1>
          <div className="mx-auto mt-4 h-1 w-24 -rotate-1 rounded-full bg-[#00D1FF]" />

          <p className="mt-5 text-zinc-300">
            Acompanhe a Chicago Barber no Instagram
          </p>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-md bg-[#FF5A00] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(255,90,0,0.8)] transition hover:bg-[#ff6f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
            </svg>
            Instagram
          </a>
        </div>
      </main>
    </div>
  );
}
