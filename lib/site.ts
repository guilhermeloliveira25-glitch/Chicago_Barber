import { OPENING_TIME, CLOSING_TIME, formatTime } from "@/components/booking/bookingUtils";

/*
  Dados da barbearia usados no rodapé e na seção "Onde estamos".
  Deixe "" (vazio) o que a barbearia não tiver: o botão/ícone correspondente some sozinho.
*/
export const SITE = {
  name: "Chicago Barber",

  address: {
    street: "R. João Carlos Zanaroli, 86",
    district: "Jardim Angelica",
    city: "Guarulhos - SP",
    zip: "07260-490",
  },

  // Link do Google Maps usado no botão "Como chegar"
  mapsUrl: "https://share.google/qvU5kILEKyJJQnymC",

  // Só números, com DDD (ex.: "11999999999")
  phone: "",
  whatsapp: "",

  // Links completos das redes (deixe "" para esconder o ícone)
  instagram: "https://www.instagram.com/gui_gold_barber/",
  tiktok: "",
  facebook: "",

  // Foto da barbearia (coloque o arquivo em /public/images/).
  // Enquanto o arquivo não existir, aparece um painel gráfico no lugar.
  shopImage: "/images/barbearia.webp",

  // Dias e horário de atendimento (vem da mesma configuração do agendamento)
  hours: `Segunda a sábado, das ${formatTime(OPENING_TIME)} às ${formatTime(CLOSING_TIME)}`,
};

export function addressLine(): string {
  const { street, district, city, zip } = SITE.address;
  return `${street} - ${district}, ${city}, ${zip}`;
}

// Usa o link do Maps informado; se estiver vazio, monta uma busca pelo endereço.
export function mapsLink(): string {
  return (
    SITE.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine())}`
  );
}

export function instagramHandle(): string {
  const last = SITE.instagram.split("/").filter(Boolean).pop();
  return last ? `@${last}` : "";
}
