import { supabaseAdmin } from "../config/supabase-admin.js";

const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour

export async function generatePlaybackUrl(trackId: string) {
  // Find the requested active track
  const { data: track, error: trackError } = await supabaseAdmin
    .from("tracks")
    .select("id, title, artist, audio_storage_path, duration_seconds")
    .eq("id", trackId)
    .eq("is_active", true)
    .maybeSingle();

  if (trackError) throw trackError;

  if (!track) {
    return null;
  }

  // Generate a temporary URL for the private audio file
  const { data, error } = await supabaseAdmin.storage
    .from("audio")
    .createSignedUrl(track.audio_storage_path, SIGNED_URL_EXPIRY);

  if (error) throw error;

  return {
    track: {
      id: track.id,
      title: track.title,
      artist: track.artist,
      duration_seconds: track.duration_seconds,
    },
    playbackUrl: data.signedUrl,
    expiresIn: SIGNED_URL_EXPIRY,
    expiresAt: new Date(
      Date.now() + SIGNED_URL_EXPIRY * 1000,
    ).toISOString(),
  };
}