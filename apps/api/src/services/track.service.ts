import { supabaseAdmin } from "../config/supabase-admin.js";

interface GetTracksOptions {
  page: number;
  limit: number;
  search?: string;
}

export async function getTracks({
  page,
  limit,
  search,
}: GetTracksOptions) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseAdmin
    .from("tracks")
    .select(
      `
        id,
        title,
        artist,
        album,
        duration_seconds,
        cover_storage_path,
        created_at
      `,
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (search) {
    // Remove characters that could alter the PostgREST filter syntax.
    const safeSearch = search
      .replace(/[,%*()\\]/g, " ")
      .trim();

    if (safeSearch) {
      query = query.or(
        `title.ilike.%${safeSearch}%,artist.ilike.%${safeSearch}%,album.ilike.%${safeSearch}%`,
      );
    }
  }

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    tracks: data ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
      hasNextPage: to + 1 < (count ?? 0),
      hasPreviousPage: page > 1,
    },
  };
}