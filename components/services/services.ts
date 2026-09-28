import type { BarberService } from "./serviceCard";

export const SERVICES: BarberService[] = [
  { id: "corte", name: "Corte", price: 33, duration: 40,
    image: "/images/corte.jpg"
   },
  { id: "barba", name: "Barba", price: 18, duration: 15, image: "/images/barba.jpg" },
  { id: "barba-terapia", name: "Barba terapia", price: 28, duration: 30, image: "/images/barba-terapia.jpg" },
  { id: "sobrancelha", name: "Sobrancelha", price: 10, duration: 10, image: "/images/sobrancelha.jpg" },
  { id: "escova-penteado", name: "Escova / penteado", price: 13, duration: 20, image: "/images/escova-penteado.jpg" },
  { id: "acabamento-pezinho", name: "Acabamento / pezinho", price: 9, duration: 15, image: "/images/acabamento-pezinho.jpg" },
  {
    id: "progressiva-masculina",
    name: "Progressiva masculina",
    price: 58,
    duration: 120,
    image: "/images/progressiva-masculina.jpg"
  },
  {
    id: "coloracao-tintura",
    name: "Coloração com tintura",
    price: 45,
    duration: 60,
    image: "/images/coloracao-tintura.jpg"
  },
  { id: "hidratacao", name: "Hidratação", price: 23, duration: 30, image: "/images/hidratacao.jpg" },
];