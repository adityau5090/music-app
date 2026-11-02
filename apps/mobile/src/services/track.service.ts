import { supabase } from "../lib/supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Track {
  id: string;
  title: string;
  artist: string | null;
  album: string | null;
  duration_seconds: number | null;
  cover_storage_path: string | null;
  coverUrl: string | null;
  created_at: string;
}

interface TracksResponse {
  success: boolean;
  tracks: Omit<Track, "coverUrl">[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getTracks(page = 1, search = "") {
  if (!API_URL) throw new Error("Missing EXPO_PUBLIC_API_URL");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Please log in first");
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: "20",
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${API_URL}/api/v1/tracks?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  const result: TracksResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error("Unable to fetch tracks");
  }

  const tracks: Track[] = result.tracks.map((track) => ({
    ...track,
    coverUrl: track.cover_storage_path
      ? supabase.storage
          .from("covers")
          .getPublicUrl(track.cover_storage_path).data.publicUrl
      : null,
  }));

  return {
    tracks,
    pagination: result.pagination,
  };
}
