import { OPENING_TIME, CLOSING_TIME, formatTime } from "@/components/booking/bookingUtils";

/*
  Dados da barbearia usados no rodapé e na seção "Onde estamos".
  ATENÇÃO: troque os valores marcados com "TROCAR" pelos dados reais.
  Deixe "" (vazio) o que a barbearia não tiver: o botão/ícone correspondente some sozinho.
*/
export const SITE = {
  name: "Chicago Barber",

  // TROCAR: endereço real da barbearia
  address: {
    street: "Rua Exemplo, 123",
    district: "Bairro",
    city: "Cidade/UF",
  },

  // Só números, com DDD (ex.: "11999999999")
  phone: "",
  whatsapp: "",

  // Links completos das redes (deixe "" para esconder o ícone)
  instagram: "https://www.instagram.com/gui_gold_barber/",
  tiktok: "",
  facebook: "",

  // Foto da barbearia (coloque o arquivo em /public/images/).
  // Enquanto o arquivo não existir, aparece um painel gráfico no lugar.
  shopImage: "/images/barbearia.jpg",

  // Dias e horário de atendimento (vem da mesma configuração do agendamento)
  hours: `Segunda a sábado, das ${formatTime(OPENING_TIME)} às ${formatTime(CLOSING_TIME)}`,
};

export function addressLine(): string {
  const { street, district, city } = SITE.address;
  return [street, district, city].filter(Boolean).join(" – ");
}

export function mapsLink(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine())}`;
}

export function instagramHandle(): string {
  const last = SITE.instagram.split("/").filter(Boolean).pop();
  return last ? `@${last}` : "";
}
