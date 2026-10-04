import Link from "next/link";
import Image from "next/image";
import { marker } from "@/lib/fonts";

export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-1 overflow-hidden">
      <Image
        src="/images/chicago-barber-foto-01.jpg"
        alt="Corte realizado pela Chicago Barber"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#00D1FF]/20 to-transparent" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[2px] bg-[#00D1FF] shadow-[0_0_24px_6px_rgba(0,209,255,0.7)]"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-16 text-[#F5F5F5] sm:px-12">
        <h1
          className={`${marker.className} mb-4 max-w-2xl text-5xl leading-none text-white md:text-8xl`}
        >
          Chicago Barber
        </h1>

        <div className="mb-6 h-1 w-28 -rotate-1 rounded-full bg-[#00D1FF]" />

        <p className="mb-8 max-w-xs text-lg text-zinc-200">
          Seu estilo começa aqui!
        </p>

        <Link
          href="/booking"
          className="w-fit rounded-md bg-[#FF5A00] px-6 py-4 text-sm font-extrabold uppercase tracking-widest text-white shadow-[0_8px_24px_-8px_rgba(255,90,0,0.8)] transition hover:bg-[#ff6f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
        >
          Agende seu horário
        </Link>
      </div>
    </section>
  );
}
