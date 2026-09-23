"use client";
user("Guilherme");
function user(name: string) {
        return `Olá, ${name}!`;
    }
import { useState } from "react";
type service = {
    name: string;
    price: number;
    duration: number;
};
export default function Services() {
const [selectedService, setSelectedService] = useState<service | null>(null);
const servicesList = [
    { name: "Corte", price: 33.00, duration: 40 },
    { name: "Barba", price: 18.00, duration: 15 },
    { name: "Barba terapia", price: 28.00, duration: 30 },
    { name: "Sobrancelha", price: 10.00, duration: 10 },
];
return (
    <div className="min-h-screen bg-[#0B0B0B] px-6 py-16 text-[#F5F1E8]">
        <h1 className="mb-3 text-4xl font-black uppercase tracking-tight">Serviços</h1>
        <p className="mb-10 text-zinc-400">Confira nossos serviços de barbearia!</p>
        <div className="grid gap-4 sm:grid-cols-2"> {servicesList.map((service) => (
            <button className={`w-full border p-6 text-left text-lg font-bold uppercase tracking-wide transition hover:-translate-y-1 ${
  selectedService?.name === service.name
    ? "border-red-500 bg-red-950"
    : "border-zinc-800 bg-zinc-950 hover:border-red-500 hover:bg-zinc-900"
}`} key={service.name} onClick={() => setSelectedService(service)}>
                <span className="block">{service.name}</span>
<span className="mt-2 block text-sm font-normal normal-case tracking-normal text-zinc-400">
  R$ {service.price.toFixed(2)} · {service.duration} min
</span>
            </button>
        ))}
        </div>
        <p>Serviço selecionado: {selectedService ? selectedService.name : "Nenhum"}</p>
    </div>
)
};
