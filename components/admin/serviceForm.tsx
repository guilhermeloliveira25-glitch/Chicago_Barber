"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { MEDIA_BUCKET, mediaUrl, type ServiceRow } from "@/lib/services";
import {
  compressImage,
  uniqueSlug,
  VIDEO_MAX_BYTES,
  VIDEO_TYPES,
} from "@/lib/media";
import ServiceImage from "@/components/services/serviceImage";

type ServiceFormProps = {
  service: ServiceRow | null; // null = novo serviço
  existingSlugs: string[];
  nextOrder: number;
  onSaved: (message: string) => void;
  onCancel: () => void;
};

const inputClass =
  "mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/30";

const labelClass = "block text-sm font-semibold text-zinc-300";

export default function ServiceForm({
  service,
  existingSlugs,
  nextOrder,
  onSaved,
  onCancel,
}: ServiceFormProps) {
  const [name, setName] = useState(service?.name ?? "");
  const [price, setPrice] = useState(
    service ? String(service.price).replace(".", ",") : "",
  );
  const [duration, setDuration] = useState(
    service ? String(service.duration) : "",
  );
  const [description, setDescription] = useState(service?.description ?? "");
  const [active, setActive] = useState(service?.active ?? true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function upload(path: string, file: Blob, contentType: string) {
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, {
        contentType,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const priceNumber = Number(price.replace(",", "."));
    const durationNumber = Number(duration);

    if (trimmedName.length < 2) {
      setError("Informe o nome do serviço.");
      return;
    }

    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("Informe um valor válido (por exemplo 33,00).");
      return;
    }

    if (!Number.isInteger(durationNumber) || durationNumber <= 0) {
      setError("Informe a duração em minutos (número inteiro maior que zero).");
      return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
      setError("A foto precisa ser uma imagem (JPG, PNG ou WebP).");
      return;
    }

    if (videoFile) {
      if (!VIDEO_TYPES.includes(videoFile.type)) {
        setError("O vídeo precisa ser MP4 ou WebM.");
        return;
      }

      if (videoFile.size > VIDEO_MAX_BYTES) {
        setError("O vídeo passa de 30 MB. Use um vídeo mais curto ou comprimido.");
        return;
      }
    }

    setSaving(true);

    const uploaded: string[] = []; // para limpar se algo der errado
    const toRemove: string[] = []; // mídias antigas, removidas só depois de salvar

    try {
      const slug = service?.slug ?? uniqueSlug(trimmedName, existingSlugs);

      let imagePath = service?.image_path ?? null;
      let videoPath = service?.video_path ?? null;

      if (imageFile) {
        const blob = await compressImage(imageFile);
        const extension = blob.type === "image/webp" ? "webp" : "jpg";
        const path = `${slug}/foto-${Date.now()}.${extension}`;

        await upload(path, blob, blob.type);
        uploaded.push(path);

        if (imagePath) toRemove.push(imagePath);
        imagePath = path;
      } else if (removeImage && imagePath) {
        toRemove.push(imagePath);
        imagePath = null;
      }

      if (videoFile) {
        const extension = videoFile.type === "video/webm" ? "webm" : "mp4";
        const path = `${slug}/video-${Date.now()}.${extension}`;

        await upload(path, videoFile, videoFile.type);
        uploaded.push(path);

        if (videoPath) toRemove.push(videoPath);
        videoPath = path;
      } else if (removeVideo && videoPath) {
        toRemove.push(videoPath);
        videoPath = null;
      }

      const payload = {
        name: trimmedName,
        price: priceNumber,
        duration: durationNumber,
        description: description.trim() || null,
        image_path: imagePath,
        video_path: videoPath,
        active,
      };

      const { error: saveError } = service
        ? await supabase.from("services").update(payload).eq("id", service.id)
        : await supabase
            .from("services")
            .insert({ ...payload, slug, sort_order: nextOrder });

      if (saveError) {
        throw saveError;
      }

      if (toRemove.length > 0) {
        // Se a limpeza falhar, só sobra um arquivo sem uso: não é um erro para o admin.
        await supabase.storage.from(MEDIA_BUCKET).remove(toRemove);
      }

      onSaved(
        service
          ? `"${trimmedName}" foi atualizado.`
          : `"${trimmedName}" foi criado.`,
      );
    } catch (err) {
      console.error(err);

      if (uploaded.length > 0) {
        await supabase.storage.from(MEDIA_BUCKET).remove(uploaded);
      }

      setError(
        "Não foi possível salvar. Confira sua conexão e tente de novo.",
      );
    } finally {
      setSaving(false);
    }
  }

  const hasImage = Boolean(service?.image_path) && !removeImage;
  const hasVideo = Boolean(service?.video_path) && !removeVideo;

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border border-white/10 bg-zinc-950/90 p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[#DC2626]" />

      <h2 className="text-2xl font-extrabold uppercase text-white">
        {service ? "Editar serviço" : "Novo serviço"}
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="service-name" className={labelClass}>
            Nome
          </label>
          <input
            id="service-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={60}
            className={inputClass}
            placeholder="Ex.: Corte degradê"
          />
        </div>

        <div>
          <label htmlFor="service-price" className={labelClass}>
            Valor (R$)
          </label>
          <input
            id="service-price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            required
            inputMode="decimal"
            className={inputClass}
            placeholder="33,00"
          />
        </div>

        <div>
          <label htmlFor="service-duration" className={labelClass}>
            Duração (minutos)
          </label>
          <input
            id="service-duration"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
            inputMode="numeric"
            className={inputClass}
            placeholder="40"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="service-description" className={labelClass}>
            Descrição <span className="font-normal text-zinc-500">(opcional)</span>
          </label>
          <textarea
            id="service-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={600}
            className={inputClass}
            placeholder="Aparece quando o cliente clica em “Ver detalhes”."
          />
        </div>

        {/* Foto */}
        <div>
          <label htmlFor="service-image" className={labelClass}>
            Foto
          </label>

          {hasImage && (
            <div className="relative mt-2 h-32 w-full overflow-hidden rounded-md border border-white/10 bg-zinc-900">
              <ServiceImage
                src={mediaUrl(service?.image_path)}
                alt={`Foto de ${service?.name}`}
                sizes="300px"
                className="object-cover"
              />
            </div>
          )}

          <input
            id="service-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setImageFile(event.target.files?.[0] ?? null);
              setRemoveImage(false);
            }}
            className="mt-2 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-[#DC2626] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#EF4444]"
          />
          <p className="mt-1 text-xs text-zinc-500">
            A foto é reduzida automaticamente antes de enviar.
          </p>

          {hasImage && !imageFile && (
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-[#EF4444]"
            >
              Remover foto atual
            </button>
          )}
          {removeImage && (
            <p className="mt-2 text-xs text-[#EF4444]">
              A foto será removida ao salvar.
            </p>
          )}
        </div>

        {/* Vídeo */}
        <div>
          <label htmlFor="service-video" className={labelClass}>
            Vídeo <span className="font-normal text-zinc-500">(opcional)</span>
          </label>

          {hasVideo && (
            <video
              src={mediaUrl(service?.video_path)}
              controls
              playsInline
              preload="metadata"
              className="mt-2 h-32 w-full rounded-md bg-black"
            />
          )}

          <input
            id="service-video"
            type="file"
            accept="video/mp4,video/webm"
            onChange={(event) => {
              setVideoFile(event.target.files?.[0] ?? null);
              setRemoveVideo(false);
            }}
            className="mt-2 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-700 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-zinc-600"
          />
          <p className="mt-1 text-xs text-zinc-500">
            MP4 ou WebM, até 30 MB. Vídeos curtos carregam mais rápido.
          </p>

          {hasVideo && !videoFile && (
            <button
              type="button"
              onClick={() => setRemoveVideo(true)}
              className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:text-[#EF4444]"
            >
              Remover vídeo atual
            </button>
          )}
          {removeVideo && (
            <p className="mt-2 text-xs text-[#EF4444]">
              O vídeo será removido ao salvar.
            </p>
          )}
        </div>

        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="h-5 w-5 accent-[#DC2626]"
          />
          <span className="text-sm text-zinc-300">
            Mostrar este serviço no site (desmarque para esconder sem apagar)
          </span>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 border-l-4 border-[#DC2626] bg-black/40 p-3 text-sm text-zinc-200"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[#DC2626] px-8 py-3 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_8px_24px_-8px_rgba(220,38,38,0.8)] transition hover:bg-[#EF4444] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-zinc-700 px-8 py-3 text-base font-bold uppercase tracking-wide text-zinc-300 transition hover:border-[#00D1FF] hover:text-[#00D1FF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
