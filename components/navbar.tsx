"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

/*
  Arquivos em /public:
  /public/logo.png
  /public/icons/home.png
  /public/icons/services.png
  /public/icons/contact.png
  /public/icons/booking.png
  /public/icons/user.png   (login e perfil usam o mesmo ícone)
  /public/icons/menu.png   (botão do menu no celular)
*/

const NAV_LINKS = [
    { href: "/", label: "Home", icon: "/icons/home.png" },
    { href: "/services", label: "Serviços", icon: "/icons/services.png" },
    { href: "/contact", label: "Contato", icon: "/icons/contact.png" },
]

const iconClass =
    "h-8 w-8 object-contain transition duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,209,255,0.6)]"

const focusClass =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"

// Ícone que some sozinho se o arquivo não existir (sem imagem quebrada).
function NavIcon({
    src,
    className = iconClass,
    fallback = null,
}: {
    src: string
    className?: string
    fallback?: ReactNode
}) {
    const [failed, setFailed] = useState(false)

    if (failed) {
        return <>{fallback}</>
    }

    return (
        <Image
            src={src}
            alt=""
            width={32}
            height={32}
            onError={() => setFailed(true)}
            className={className}
        />
    )
}

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()

    // undefined/null = deslogado (o botão Login sempre aparece) | string = e-mail do usuário
    const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [signingOut, setSigningOut] = useState(false)
    const navRef = useRef<HTMLElement>(null)

    useEffect(() => {
        let active = true

        // getSession lê a sessão salva no navegador (não depende de rede)
        supabase.auth
            .getSession()
            .then(({ data }) => {
                if (active) setUserEmail(data.session?.user?.email ?? null)
            })
            .catch(() => {
                if (active) setUserEmail(null)
            })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email ?? null)
            setProfileOpen(false)
        })

        return () => {
            active = false
            listener.subscription.unsubscribe()
        }
    }, [])

    // fecha os menus ao clicar fora da navbar ou apertar Esc
    useEffect(() => {
        if (!mobileOpen && !profileOpen) return

        function handleClick(event: MouseEvent) {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setMobileOpen(false)
                setProfileOpen(false)
            }
        }
        function handleKey(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMobileOpen(false)
                setProfileOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)
        document.addEventListener("keydown", handleKey)
        return () => {
            document.removeEventListener("mousedown", handleClick)
            document.removeEventListener("keydown", handleKey)
        }
    }, [mobileOpen, profileOpen])

    function closeMenus() {
        setMobileOpen(false)
        setProfileOpen(false)
    }

    async function handleSignOut() {
        setSigningOut(true)
        await supabase.auth.signOut()
        setSigningOut(false)
        closeMenus()
        router.push("/")
        router.refresh()
    }

    const isLogged = typeof userEmail === "string"

    function linkClass(href: string) {
        const active = pathname === href
        return `group relative flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold uppercase tracking-widest transition hover:text-[#00D1FF] lg:px-3 ${focusClass} ${
            active ? "text-white" : "text-zinc-300"
        }`
    }

    const activeBar = (href: string) =>
        pathname === href ? (
            <span aria-hidden className="absolute inset-x-2 -bottom-0.5 lg:inset-x-3 h-0.5 rounded-full bg-[#FF5A00]" />
        ) : null

    const bookingClass = `group flex items-center gap-2 rounded-md bg-[#FF5A00] px-3 py-2 text-sm font-extrabold uppercase tracking-wider text-white shadow-[0_6px_20px_-8px_rgba(255,90,0,0.9)] lg:px-4 transition hover:bg-[#ff6f1f] ${focusClass}`

    return (
        <nav
            ref={navRef}
            className="relative z-50 border-b border-white/10 bg-[#0B0B0B]/90 px-4 py-2 backdrop-blur sm:px-6"
        >
            <div className="mx-auto flex max-w-6xl items-center justify-between">
                <Link href="/" onClick={closeMenus} aria-label="Chicago Barber - página inicial" className={`rounded-md ${focusClass}`}>
                    <Image
                        src="/logo.png"
                        alt="Chicago Barber"
                        width={360}
                        height={198}
                        priority
                        className="h-12 w-auto sm:h-14"
                    />
                </Link>

                {/* ---------- Desktop ---------- */}
                <ul className="m-0 hidden list-none items-center gap-1 p-0 sm:flex lg:gap-3">
                    {NAV_LINKS.map((item) => (
                        <li key={item.href}>
                            <Link
                                className={linkClass(item.href)}
                                href={item.href}
                                aria-current={pathname === item.href ? "page" : undefined}
                                aria-label={item.label}
                                title={item.label}
                            >
                                <NavIcon src={item.icon} />
                                <span className="hidden lg:inline">{item.label}</span>
                                {activeBar(item.href)}
                            </Link>
                        </li>
                    ))}

                    <li>
                        <Link className={bookingClass} href="/booking" aria-label="Agendamento" title="Agendamento">
                            <NavIcon src="/icons/booking.png" />
                            <span className="hidden lg:inline">Agendamento</span>
                        </Link>
                    </li>

                    <li className="relative">
                        {isLogged ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setProfileOpen((open) => !open)}
                                    aria-haspopup="menu"
                                    aria-expanded={profileOpen}
                                    aria-label="Perfil"
                                    title="Perfil"
                                    className={`${linkClass("#perfil")} ${profileOpen ? "text-[#00D1FF]" : ""}`}
                                >
                                    <NavIcon src="/icons/user.png" />
                                    <span className="hidden lg:inline">Perfil</span>
                                </button>

                                {profileOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 top-full z-50 mt-3 w-64 border border-white/10 bg-zinc-950 p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.9)]"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-0.5 bg-[#FF5A00]" />
                                        <p className="truncate px-3 pb-2 pt-3 text-xs text-zinc-400" title={userEmail}>
                                            {userEmail}
                                        </p>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleSignOut}
                                            disabled={signingOut}
                                            className="w-full rounded-md px-3 py-2 text-left text-sm font-bold uppercase tracking-wider text-zinc-200 transition hover:bg-white/5 hover:text-[#FF5A00] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {signingOut ? "Saindo..." : "Sair"}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                className={linkClass("/login")}
                                href="/login"
                                aria-current={pathname === "/login" ? "page" : undefined}
                                aria-label="Login"
                                title="Login"
                            >
                                <NavIcon src="/icons/user.png" />
                                <span className="hidden lg:inline">Login</span>
                                {activeBar("/login")}
                            </Link>
                        )}
                    </li>
                </ul>

                {/* ---------- Celular: atalhos + botão do menu ---------- */}
                <div className="flex items-center gap-1 sm:hidden">
                    <Link
                        href="/booking"
                        onClick={closeMenus}
                        aria-label="Agendamento"
                        className={`group flex h-11 w-11 items-center justify-center rounded-md bg-[#FF5A00] shadow-[0_6px_20px_-8px_rgba(255,90,0,0.9)] ${focusClass}`}
                    >
                        <NavIcon src="/icons/booking.png" className="h-8 w-8 object-contain" />
                    </Link>

                    {isLogged ? (
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Perfil"
                            className={`group flex h-11 w-11 items-center justify-center rounded-md ${focusClass}`}
                        >
                            <NavIcon src="/icons/user.png" className="h-8 w-8 object-contain" />
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            onClick={closeMenus}
                            aria-label="Login"
                            className={`group flex h-11 w-11 items-center justify-center rounded-md ${focusClass}`}
                        >
                            <NavIcon src="/icons/user.png" className="h-8 w-8 object-contain" />
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => setMobileOpen((open) => !open)}
                        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        className={`group flex h-11 w-11 items-center justify-center rounded-md ${focusClass}`}
                    >
                        <NavIcon
                            src="/icons/menu.png"
                            className="h-8 w-8 object-contain transition duration-200 group-active:scale-90"
                            fallback={
                                <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7 text-[#FF5A00]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M4 7h16M4 12h16M4 17h16" />
                                </svg>
                            }
                        />
                    </button>
                </div>
            </div>

            {/* ---------- Menu do celular ---------- */}
            {mobileOpen && (
                <ul
                    id="mobile-menu"
                    className="m-0 mt-2 list-none space-y-1 border-t border-white/10 p-0 pb-2 pt-2 sm:hidden"
                >
                    {NAV_LINKS.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={closeMenus}
                                aria-current={pathname === item.href ? "page" : undefined}
                                className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-semibold uppercase tracking-widest transition hover:bg-white/5 ${focusClass} ${
                                    pathname === item.href ? "text-white" : "text-zinc-300"
                                }`}
                            >
                                <NavIcon src={item.icon} />
                                {item.label}
                            </Link>
                        </li>
                    ))}

                    <li>
                        <Link
                            href="/booking"
                            onClick={closeMenus}
                            className={`flex items-center gap-3 rounded-md bg-[#FF5A00] px-3 py-3 text-base font-extrabold uppercase tracking-wider text-white ${focusClass}`}
                        >
                            <NavIcon src="/icons/booking.png" />
                            Agendamento
                        </Link>
                    </li>

                    <li>
                        {isLogged ? (
                            <div className="rounded-md border border-white/10 bg-zinc-950 px-3 py-3">
                                <div className="flex items-center gap-3">
                                    <NavIcon src="/icons/user.png" />
                                    <p className="truncate text-sm text-zinc-400" title={userEmail}>
                                        {userEmail}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    disabled={signingOut}
                                    className={`mt-3 w-full rounded-md border border-zinc-700 px-3 py-2 text-sm font-bold uppercase tracking-wider text-zinc-200 transition hover:border-[#FF5A00] hover:text-[#FF5A00] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
                                >
                                    {signingOut ? "Saindo..." : "Sair"}
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={closeMenus}
                                className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-semibold uppercase tracking-widest text-zinc-300 transition hover:bg-white/5 hover:text-[#00D1FF] ${focusClass}`}
                            >
                                <NavIcon src="/icons/user.png" />
                                Login
                            </Link>
                        )}
                    </li>
                </ul>
            )}

            <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FF5A00] to-transparent" />
        </nav>
    )
}