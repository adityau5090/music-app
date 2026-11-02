import { supabase } from "../lib/supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface PlaybackResponse {
  success: boolean;
  track: {
    id: string;
    title: string;
    artist: string | null;
    duration_seconds: number | null;
    cover_storage_path: string | null;
  };
  playbackUrl: string;
  expiresIn: number;
  expiresAt: string;
}

export async function getPlaybackUrl(trackId: string) {
  if (!API_URL) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in");
  }

  const response = await fetch(
    `${API_URL}/api/v1/tracks/${trackId}/playback-url`,
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to load track");
  }

  return result as PlaybackResponse;
}