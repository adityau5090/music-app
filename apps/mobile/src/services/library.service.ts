import { supabase } from "../lib/supabase";
import type { Track } from "./track.service";

export interface MusicFolder {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

function getCoverUrl(path: string | null) {
  if (!path) return null;

  return supabase.storage
    .from("covers")
    .getPublicUrl(path).data.publicUrl;
}

async function getUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Please log in first");

  return user.id;
}

// Get all liked track IDs for the current user.
export async function getLikedTrackIds(): Promise<string[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("liked_tracks")
    .select("track_id")
    .eq("user_id", userId);

  if (error) throw error;

  return (data ?? []).map((item) => item.track_id);
}

// Like or unlike a track.
export async function toggleLike(
  trackId: string,
  currentlyLiked: boolean,
) {
  const userId = await getUserId();

  if (currentlyLiked) {
    const { error } = await supabase
      .from("liked_tracks")
      .delete()
      .eq("user_id", userId)
      .eq("track_id", trackId);

    if (error) throw error;

    return false;
  }

  const { error } = await supabase
    .from("liked_tracks")
    .insert({
      user_id: userId,
      track_id: trackId,
    });

  if (error) throw error;

  return true;
}

// Get liked songs with their track details.
export async function getLikedTracks(): Promise<Track[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("liked_tracks")
    .select(`
      created_at,
      track:tracks (
        id,
        title,
        artist,
        album,
        duration_seconds,
        cover_storage_path,
        created_at
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.track)
    .filter(Boolean)
    .map((track: any) => ({
      ...track,
      coverUrl: getCoverUrl(track.cover_storage_path),
    }));
}

// Get the current user's folders.
export async function getFolders(): Promise<MusicFolder[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from("folders")
    .select("id, user_id, name, description, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

// Create a folder.
export async function createFolder(name: string) {
  const userId = await getUserId();
  const cleanName = name.trim();

  if (!cleanName) throw new Error("Folder name is required");

  const { data, error } = await supabase
    .from("folders")
    .insert({
      user_id: userId,
      name: cleanName,
    })
    .select()
    .single();

  if (error) throw error;

  return data as MusicFolder;
}

// Delete a folder.
export async function deleteFolder(folderId: string) {
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId);

  if (error) throw error;
}

// Add a track to a folder.
export async function addTrackToFolder(
  folderId: string,
  trackId: string,
) {
  const { error } = await supabase
    .from("folder_tracks")
    .insert({
      folder_id: folderId,
      track_id: trackId,
      position: 0,
    });

  if (error) throw error;
}

// Remove a track from a folder.
export async function removeTrackFromFolder(
  folderId: string,
  trackId: string,
) {
  const { error } = await supabase
    .from("folder_tracks")
    .delete()
    .eq("folder_id", folderId)
    .eq("track_id", trackId);

  if (error) throw error;
}

// Get all tracks in a folder.
export async function getFolderTracks(
  folderId: string,
): Promise<Track[]> {
  const { data, error } = await supabase
    .from("folder_tracks")
    .select(`
      position,
      track:tracks (
        id,
        title,
        artist,
        album,
        duration_seconds,
        cover_storage_path,
        created_at
      )
    `)
    .eq("folder_id", folderId)
    .order("position", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .map((row: any) => row.track)
    .filter(Boolean)
    .map((track: any) => ({
      ...track,
      coverUrl: getCoverUrl(track.cover_storage_path),
    }));
}
