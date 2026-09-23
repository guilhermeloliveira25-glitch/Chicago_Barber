import Link from "next/link"
export default function Navbar() {
    return (
        <nav className="relative z-50 border-b border-zinc-800 bg-[#0B0B0B] px-6 py-5">
            <ul className="m-0 flex list-none items-center gap-6 p-0">
                <li>
                    <Link className="text-sm uppercase tracking-widest text-zinc-300 transition hover:text-red-500" href="/">Home</Link>
                </li>
                <li>
                    <Link className="text-sm uppercase tracking-widest text-zinc-300 transition hover:text-red-500" href="/services">Serviços</Link>
                </li>
                <li>
                    <Link className="text-sm uppercase tracking-widest text-zinc-300 transition hover:text-red-500" href="/contact">Contato</Link>
                </li>
                <li> 
                    <Link className="bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-500" href="/booking">Agendamento</Link>
                </li>
            </ul>
        </nav>
    )
}