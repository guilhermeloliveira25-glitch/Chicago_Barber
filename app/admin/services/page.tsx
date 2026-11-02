"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  fetchAllServices,
  mediaUrl,
  type ServiceRow,
} from "@/lib/services";
import { formatPrice, formatDuration } from "@/components/booking/bookingUtils";
import ServiceForm from "@/components/admin/serviceForm";
import ServiceImage from "@/components/services/serviceImage";
import GraffitiBackground from "@/components/ui/graffitiBackground";
import PageHeading from "@/components/ui/pageHeading";

type Notice = { type: "success" | "error"; text: string } | null;

const smallButton =
  "rounded-md border border-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:border-[#00D1FF] hover:text-[#00D1FF] disabled:cursor-not-allowed disabled:opacity-40";

export default function AdminServicesPage() {
  const router = useRouter();

  const [allowed, setAllowed] = useState(false);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // undefined = formulário fechado | null = novo serviço | ServiceRow = editando
  const [editing, setEditing] = useState<ServiceRow | null | undefined>(
    undefined,
  );
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);

  // 1) Só admin entra. (A proteção de verdade está no banco; isto é a porta de entrada visual.)
  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase.rpc("is_admin");

      if (!active) return;

      if (error || data !== true) {
        router.replace("/");
        return;
      }

      setAllowed(true);
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [router]);

  // 2) Carrega a lista (e recarrega quando algo muda)
  useEffect(() => {
    if (!allowed) return;

    let active = true;

    fetchAllServices()
      .then((list) => {
        if (!active) return;
        setServices(list);
        setLoadError("");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (!active) return;
        setLoadError("Não foi possível carregar os serviços.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed, reloadKey]);

  function reload() {
    setReloadKey((key) => key + 1);
  }

  function openForm(service: ServiceRow | null) {
    setNotice(null);
    setEditing(service);

    requestAnimationFrame(() => {
      document
        .getElementById("form-servico")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function toggleActive(service: ServiceRow) {
    setBusy(true);
    setNotice(null);

    const { error } = await supabase
      .from("services")
      .update({ active: !service.active })
      .eq("id", service.id);

    setBusy(false);

    if (error) {
      console.error(error);
      setNotice({ type: "error", text: "Não foi possível alterar o serviço." });
      return;
    }

    setNotice({
      type: "success",
      text: service.active
        ? `"${service.name}" foi escondido do site.`
        : `"${service.name}" voltou para o site.`,
    });
    reload();
  }

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= services.length) return;

    const reordered = [...services];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    setBusy(true);
    setNotice(null);

    // Regrava a ordem de todos (de 10 em 10), assim nunca há empate.
    const results = await Promise.all(
      reordered.map((service, position) =>
        service.sort_order === position * 10
          ? null
          : supabase
              .from("services")
              .update({ sort_order: position * 10 })
              .eq("id", service.id),
      ),
    );

    setBusy(false);

    if (results.some((result) => result && result.error)) {
      setNotice({ type: "error", text: "Não foi possível mudar a ordem." });
    }

    reload();
  }

  if (!allowed) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
        <GraffitiBackground />
        <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Verificando permissão...
          </p>
        </main>
      </div>
    );
  }

  const nextOrder =
    services.reduce((max, service) => Math.max(max, service.sort_order), 0) + 10;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[#0B0B0B] text-[#F5F5F5]">
      <GraffitiBackground />

      <main className="relative z-10 flex-1">
        <section className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
          <PageHeading
            eyebrow="Painel do barbeiro"
            title="Gerenciar serviços"
            description="Crie, edite e organize o que aparece no site e no agendamento."
          />

          {notice && (
            <p
              role="status"
              className={`mt-8 border-l-4 bg-black/50 p-4 text-sm text-zinc-200 ${
                notice.type === "success"
                  ? "border-[#00D1FF]"
                  : "border-[#DC2626]"
              }`}
            >
              {notice.text}
            </p>
          )}

          <div className="mt-8">
            <button
              type="button"
              onClick={() => openForm(null)}
              className="rounded-md bg-[#DC2626] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.8)] transition hover:bg-[#EF4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF]"
            >
              + Novo serviço
            </button>
          </div>

          {editing !== undefined && (
            <div id="form-servico" className="mt-8 scroll-mt-6">
              <ServiceForm
                key={editing?.id ?? "novo"}
                service={editing}
                existingSlugs={services.map((service) => service.slug)}
                nextOrder={nextOrder}
                onSaved={(text) => {
                  setEditing(undefined);
                  setNotice({ type: "success", text });
                  reload();
                }}
                onCancel={() => setEditing(undefined)}
              />
            </div>
          )}

          <h2 className="mt-12 text-sm font-bold uppercase tracking-widest text-zinc-400">
            Serviços cadastrados
          </h2>

          {loading && (
            <p className="mt-4 text-zinc-400">Carregando...</p>
          )}

          {loadError && (
            <p
              role="alert"
              className="mt-4 border-l-4 border-[#DC2626] bg-black/40 p-4 text-sm text-zinc-200"
            >
              {loadError}
            </p>
          )}

          {!loading && !loadError && services.length === 0 && (
            <p className="mt-4 text-zinc-400">
              Nenhum serviço ainda. Clique em “Novo serviço” para começar.
            </p>
          )}

          <ul className="mt-4 space-y-3">
            {services.map((service, index) => (
              <li
                key={service.id}
                className={`flex flex-col gap-4 rounded-lg border bg-zinc-950/80 p-4 sm:flex-row sm:items-center ${
                  service.active ? "border-white/10" : "border-zinc-800 opacity-70"
                }`}
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-900">
                  <ServiceImage
                    src={mediaUrl(service.image_path)}
                    alt={service.name}
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-extrabold uppercase text-white">
                    <span className="truncate">{service.name}</span>
                    {!service.active && (
                      <span className="rounded border border-zinc-600 px-2 py-0.5 text-[10px] font-bold tracking-widest text-zinc-400">
                        ESCONDIDO
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    <span className="font-bold text-[#EF4444]">
                      {formatPrice(Number(service.price))}
                    </span>{" "}
                    · {formatDuration(Number(service.duration))}
                    {service.video_path ? " · com vídeo" : ""}
                    {service.description ? " · com descrição" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={busy || index === 0}
                    aria-label={`Subir ${service.name}`}
                    className={smallButton}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={busy || index === services.length - 1}
                    aria-label={`Descer ${service.name}`}
                    className={smallButton}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => openForm(service)}
                    disabled={busy}
                    className={smallButton}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(service)}
                    disabled={busy}
                    className={smallButton}
                  >
                    {service.active ? "Esconder" : "Mostrar"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
