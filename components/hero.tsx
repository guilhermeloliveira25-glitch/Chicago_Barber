import Link from "next/link";
import Image from "next/image";
export default function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      <Image src="/images/chicago-barber-foto-01.jpg" alt="Corte realizado pela Chicago Barber" fill priority className="object-cover"/>
      <div className="absolute inset-0 bg-black/55"></div>
      <div className="relative z-10 flex min-h-[calc(100vh-65px)] flex-col justify-center px-6 text-[#F5F1E8]">
      <h1 className="mb-4 max-w-md text-5xl font-black uppercase leading-none tracking-tight md:text-8xl">Chicago Barber</h1>
      <p className="mb-8 max-w-xs text-lg text-zinc-200">Seu estilo começa aqui!</p>
      <Link href="/booking">
        <button className="w-fit bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-widest text-white transition hover:bg-red-500">Agende seu horário</button>
      </Link>
      </div>
    </section>
  );
}