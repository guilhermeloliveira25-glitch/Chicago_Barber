"use client";

import { useState } from "react";
import Image from "next/image";
import { marker } from "@/lib/fonts";

type ServiceImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
};

// Mostra a foto do serviço; se o arquivo não existir, mostra um fundo
// de grafite no lugar (em vez de uma imagem quebrada).
export default function ServiceImage({
  src,
  alt,
  className = "",
  sizes,
}: ServiceImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-[#0b1a22]"
      >
        <span className={`${marker.className} text-2xl text-white/10`}>
          Chicago Barber
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
