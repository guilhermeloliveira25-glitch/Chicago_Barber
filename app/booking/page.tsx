
export default function Booking() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-[#F5F1E8]">
      <h1 className="mb-3 text-4xl font-black uppercase tracking-tight">AGENDAR HORÁRIO</h1>
      <p className="mb-10 text-zinc-400">Escolha o melhor horário para seu corte.</p>
    <section className="border border-zinc-800 bg-zinc-950 p-6">
      <label className="mb-3 block text-sm font-black uppercase tracking-widest text-zinc-300">ESCOLHA A DATA</label>
      <input type="date" className="w-full border border-zinc-700 bg-[#0B0B0B] px-4 py-3 text-[#F5F1E8] outline-none transition focus:border-red-500"></input>
    </section>
    </div>
  );
}