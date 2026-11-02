// Utilitários de mídia usados no painel admin.

export const IMAGE_MAX_SIDE = 1280;
export const VIDEO_MAX_BYTES = 30 * 1024 * 1024; // 30 MB (o bucket aceita até 50 MB)
export const VIDEO_TYPES = ["video/mp4", "video/webm"];

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(name: string, existing: string[]): string {
  const base = slugify(name) || "servico";
  let slug = base;
  let counter = 2;

  while (existing.includes(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Reduz a foto no navegador antes de enviar (foto de celular passa fácil de 5 MB).
export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, IMAGE_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem.");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let blob = await canvasToBlob(canvas, "image/webp", 0.82);

  // Alguns navegadores não geram webp: usa jpeg.
  if (!blob || blob.type !== "image/webp") {
    blob = await canvasToBlob(canvas, "image/jpeg", 0.85);
  }

  if (!blob) {
    throw new Error("Não foi possível processar a imagem.");
  }

  return blob;
}
