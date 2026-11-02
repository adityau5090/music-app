import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import { getPlaybackUrl } from "../services/playback.service";
import { supabase } from "../lib/supabase";

export interface PlaybackTrack {
  id: string;
  title: string;
  artist: string | null;
  duration_seconds: number | null;
  cover_storage_path: string | null;
  coverUrl: string | null;
}

interface PlaybackContextType {
  track: PlaybackTrack | null;
  loading: boolean;
  error: string | null;
  status: ReturnType<typeof useAudioPlayerStatus>;
  loadTrack: (id: string) => Promise<void>;
  togglePlayback: () => void;
  seekTo: (seconds: number) => void;
  player: ReturnType<typeof useAudioPlayer>;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [track, setTrack] = useState<PlaybackTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadTrack(id: string) {
    try {
      setLoading(true);
      setError(null);

      const result = await getPlaybackUrl(id);

      const coverUrl = result.track.cover_storage_path
        ? supabase.storage
            .from("covers")
            .getPublicUrl(result.track.cover_storage_path).data.publicUrl
        : null;

      setTrack({
        ...result.track,
        coverUrl,
      });

      player.replace({ uri: result.playbackUrl });
      player.play();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to play track";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function togglePlayback() {
    if (status.playing) {
      player.pause();
    } else if (track) {
      player.play();
    }
  }

  function seekTo(seconds: number) {
    player.seekTo(seconds);
  }

  return (
    <PlaybackContext.Provider
      value={{
        track,
        loading,
        error,
        status,
        loadTrack,
        togglePlayback,
        seekTo,
        player,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);

  if (!context) {
    throw new Error("usePlayback must be used inside PlaybackProvider");
  }

  return context;
}
