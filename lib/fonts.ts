import { Permanent_Marker } from "next/font/google";

// Fonte de "grafite" usada nos títulos. Fica aqui para ser carregada uma vez só.
export const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
