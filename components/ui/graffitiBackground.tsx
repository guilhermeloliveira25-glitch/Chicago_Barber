/*
  Fundo da identidade Chicago Barber: tinta laranja, textura de parede,
  iluminação azul vinda de baixo, skyline e linha de neon.
  Uso: dentro de um container "relative overflow-hidden"; o conteúdo vai
  em outro elemento com "relative z-10".
*/
export default function GraffitiBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* respingos de tinta laranja */}
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#FF5A00]/20 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-[#FF5A00]/10 blur-3xl" />

      {/* textura sutil de parede */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#F5F5F5 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* iluminação urbana azul vinda de baixo */}
      <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-[#00D1FF]/25 via-[#00D1FF]/[0.07] to-transparent" />
      <div className="absolute -bottom-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-[100%] bg-[#00D1FF]/30 blur-[110px]" />

      {/* silhueta de skyline */}
      <svg
        className="absolute inset-x-0 bottom-0 h-28 w-full text-[#06141c] sm:h-40"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0 160V110h40V70h30v40h30V90h26V50h34v60h24V80h40V30h28v50h30v30h36V60h30v50h40V90h26V40h36v70h30V70h40v40h34V50h30v60h30V80h40V20h30v60h26v30h40V90h36V60h30v50h34V80h40v30h30V70h34v40h40V90h30v70z" />
      </svg>

      {/* linha de neon no rodapé */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#00D1FF] shadow-[0_0_24px_6px_rgba(0,209,255,0.7)]" />
    </div>
  );
}
