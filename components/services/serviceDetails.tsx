"use client";

import { useId, useState } from "react";

type ServiceDetailsProps = {
  description?: string;
  video?: string;
  poster?: string;
};

// Faixa "Ver detalhes" no pé do card: abre para baixo com a descrição e o vídeo.
// Se o serviço não tem descrição nem vídeo, não aparece nada.
export default function ServiceDetails({
  description,
  video,
  poster,
}: ServiceDetailsProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!description && !video) {
    return null;
  }

  return (
    <div className="border-t border-white/10 bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between px-5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 transition hover:text-[#00D1FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#00D1FF]"
      >
        {open ? "Ocultar detalhes" : "Ver detalhes"}

        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={`h-4 w-4 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="space-y-4 px-5 pb-5">
            {description && (
              <p className="whitespace-pre-line text-sm leading-6 text-zinc-300">
                {description}
              </p>
            )}

            {video && (
              <video
                src={video}
                poster={poster || undefined}
                controls
                playsInline
                preload="none"
                className="w-full rounded-md bg-black"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
