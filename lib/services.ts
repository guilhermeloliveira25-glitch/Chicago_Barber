import { supabase } from "@/lib/supabase";
import type { BarberService } from "@/components/services/serviceCard";

export const MEDIA_BUCKET = "service-media";

// Linha da tabela "services" (como vem do banco)
export type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
  image_path: string | null;
  video_path: string | null;
  active: boolean;
  sort_order: number;
};

const COLUMNS =
  "id, slug, name, price, duration, description, image_path, video_path, active, sort_order";

export function mediaUrl(path: string | null | undefined): string {
  if (!path) {
    return "";
  }

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

// O "id" usado no site e enviado à API de agendamento é o slug do serviço.
export function rowToService(row: ServiceRow): BarberService {
  return {
    id: row.slug,
    name: row.name,
    price: Number(row.price),
    duration: Number(row.duration),
    image: mediaUrl(row.image_path),
    video: mediaUrl(row.video_path) || undefined,
    description: row.description?.trim() || undefined,
  };
}

// Serviços ativos, na ordem definida pelo admin (catálogo e agendamento)
export async function fetchActiveServices(): Promise<BarberService[]> {
  const { data, error } = await supabase
    .from("services")
    .select(COLUMNS)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ServiceRow[]).map(rowToService);
}

// Todos os serviços, inclusive desativados (só o admin consegue ler os inativos)
export async function fetchAllServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as ServiceRow[];
}
