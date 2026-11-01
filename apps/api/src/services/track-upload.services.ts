import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase-admin.js";

interface UploadTrackInput {
  title: string;
  artist?: string;
  album?: string;
  durationSeconds?: number;
  uploadedBy: string;
  audio: Express.Multer.File;
  cover: Express.Multer.File;
}

const AUDIO_TYPES: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/aac": "aac",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
};

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadTrack(input: UploadTrackInput) {
  const audioExtension = AUDIO_TYPES[input.audio.mimetype];
  const coverExtension = IMAGE_TYPES[input.cover.mimetype];

  if (!audioExtension) {
    throw new Error("Unsupported audio format");
  }

  if (!coverExtension) {
    throw new Error("Unsupported cover image format");
  }

  const trackId = randomUUID();

  const audioPath = `${trackId}.${audioExtension}`;
  const coverPath = `${trackId}.${coverExtension}`;

  const { error: audioError } = await supabaseAdmin.storage
    .from("audio")
    .upload(audioPath, input.audio.buffer, {
      contentType: input.audio.mimetype,
      upsert: false,
    });

  if (audioError) throw audioError;

  try {
    const { error: coverError } = await supabaseAdmin.storage
      .from("covers")
      .upload(coverPath, input.cover.buffer, {
        contentType: input.cover.mimetype,
        upsert: false,
    });

    if (coverError) throw coverError;

    const { data, error } = await supabaseAdmin
      .from("tracks")
      .insert({
        id: trackId,
        title: input.title,
        artist: input.artist || null,
        album: input.album || null,
        duration_seconds: input.durationSeconds ?? null,
        audio_storage_path: audioPath,
        cover_storage_path: coverPath,
        uploaded_by: input.uploadedBy,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    // Roll back uploaded objects if the operation fails.
    await supabaseAdmin.storage.from("audio").remove([audioPath]);
    await supabaseAdmin.storage.from("covers").remove([coverPath]);

    throw error;
  }
}