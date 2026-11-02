import React, { createContext, useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";

import { getPlaybackUrl } from "../services/playback.service";
import { supabase } from "../lib/supabase";
import type { Track } from "../services/track.service";

export type RepeatMode = "off" | "all" | "one";

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
  queue: PlaybackTrack[];
  queueIndex: number;
  loading: boolean;
  error: string | null;
  status: ReturnType<typeof useAudioPlayerStatus>;
  shuffle: boolean;
  repeatMode: RepeatMode;
  loadTrack: (id: string) => Promise<void>;
  playQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  togglePlayback: () => void;
  seekTo: (seconds: number) => void;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  player: ReturnType<typeof useAudioPlayer>;
  playQueueItem: (index: number) => Promise<void>;
removeFromQueue: (index: number) => void;
moveQueueItem: (from: number, to: number) => void;
}

const PlaybackContext = createContext<PlaybackContextType | null>(null);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [track, setTrack] = useState<PlaybackTrack | null>(null);
  const [queue, setQueue] = useState<PlaybackTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const queueRef = useRef<PlaybackTrack[]>([]);
  const indexRef = useRef(-1);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");
  const handledFinishRef = useRef(false);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    indexRef.current = queueIndex;
  }, [queueIndex]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    repeatRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
  if (!status.didJustFinish) {
    handledFinishRef.current = false;
    return;
  }

  if (handledFinishRef.current) return;

  handledFinishRef.current = true;

  console.log("🎵 TRACK FINISHED");
  console.log("Current track:", track?.title);
  console.log("Queue:", queueRef.current.map((t) => t.title));
  console.log("Current index:", indexRef.current);
  console.log("Repeat mode:", repeatRef.current);

  if (repeatRef.current === "one") {
    console.log("🔁 Repeating current track");

    player.seekTo(0);
    player.play();
    return;
  }

  console.log("⏭️ Playing next track");

  playNext().catch((err) => {
    console.error("Automatic next-track playback failed:", err);
  });
}, [status.didJustFinish]);

  const playTrackAtIndex = async (
  tracks: PlaybackTrack[],
  index: number
) => {
  const selectedTrack = tracks[index];

  if (!selectedTrack) {
    console.log("❌ Track not found at index:", index);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    console.log("1️⃣ Fetching playback URL:", selectedTrack.title);

    const result = await getPlaybackUrl(selectedTrack.id);

    console.log("2️⃣ Playback URL received");
    console.log("3️⃣ Updating track state");

    const updatedTrack: PlaybackTrack = {
      ...selectedTrack,
      ...result.track,
      coverUrl: selectedTrack.coverUrl,
    };

    setTrack(updatedTrack);
    setQueue(tracks);
    setQueueIndex(index);

    queueRef.current = tracks;
    indexRef.current = index;

    console.log("4️⃣ Replacing audio source");

    player.replace({ uri: result.playbackUrl });

    console.log("5️⃣ Playing audio");

    player.play();

    console.log("6️⃣ Playback commands completed");
  } catch (err) {
    console.error("❌ Track playback failed:", err);
    setError(
      err instanceof Error ? err.message : "Unable to play track"
    );
  } finally {
    setLoading(false);
  }
};

  
async function loadTrack(id: string) {
  const currentQueue = queueRef.current;

  const existingIndex = currentQueue.findIndex(
    (item) => item.id === id,
  );

  if (existingIndex !== -1) {
    await playTrackAtIndex(currentQueue, existingIndex);
    return;
  }

  const newTrack: PlaybackTrack = {
    id,
    title: "Loading...",
    artist: null,
    duration_seconds: null,
    cover_storage_path: null,
    coverUrl: null,
  };

  await playTrackAtIndex([newTrack], 0);
}


  async function playQueue(tracks: Track[], startIndex = 0) {
    if (!tracks.length) return;

    const normalizedTracks: PlaybackTrack[] = tracks.map((item) => ({
      ...item,
      coverUrl: item.coverUrl ??
        (item.cover_storage_path
          ? supabase.storage
              .from("covers")
              .getPublicUrl(item.cover_storage_path).data.publicUrl
          : null),
    }));

    const safeIndex = Math.max(
      0,
      Math.min(startIndex, normalizedTracks.length - 1),
    );

    await playTrackAtIndex(normalizedTracks, safeIndex);
  }

 const playNext = async () => {
  const currentQueue = queueRef.current;
  const currentIndex = indexRef.current;

  console.log("⏭️ playNext called");
  console.log("Queue length:", currentQueue.length);
  console.log("Current index:", currentIndex);

  const nextIndex = currentIndex + 1;

  console.log("Next index:", nextIndex);
  console.log("Next track:", currentQueue[nextIndex]?.title);

  if (nextIndex >= currentQueue.length) {
    if (repeatRef.current === "all") {
      await playTrackAtIndex(currentQueue, 0);
    }
    return;
  }

  await playTrackAtIndex(currentQueue, nextIndex);
};

  async function playPrevious() {
    if (status.currentTime > 3) {
      player.seekTo(0);
      return;
    }

    const currentQueue = queueRef.current;
    const currentIndex = indexRef.current;

    if (!currentQueue.length) return;

    let previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
      if (repeatRef.current === "all") {
        previousIndex = currentQueue.length - 1;
      } else {
        player.seekTo(0);
        return;
      }
    }

    await playTrackAtIndex(currentQueue, previousIndex);
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

  function toggleShuffle() {
    setShuffle((current) => !current);
  }

  function cycleRepeatMode() {
    setRepeatMode((current) => {
      if (current === "off") return "all";
      if (current === "all") return "one";
      return "off";
    });
  }

  // Automatically move to the next song when the current one finishes.
  useEffect(() => {
    if (!status.didJustFinish) {
      handledFinishRef.current = false;
      return;
    }

    if (handledFinishRef.current) return;
    handledFinishRef.current = true;

    if (repeatRef.current === "one") {
      player.seekTo(0);
      player.play();
      return;
    }

    playNext().catch((err) => {
      console.error("Automatic next-track playback failed:", err);
    });
  }, [status.didJustFinish]);

  async function playQueueItem(index: number) {
  const currentQueue = queueRef.current;

  if (index < 0 || index >= currentQueue.length) return;

  await playTrackAtIndex(currentQueue, index);
}

function removeFromQueue(index: number) {
  const currentQueue = queueRef.current;

  // Don't remove the currently playing song.
  if (
    index <= indexRef.current ||
    index >= currentQueue.length
  ) {
    return;
  }

  const updatedQueue = currentQueue.filter((_, i) => i !== index);

  queueRef.current = updatedQueue;
  setQueue(updatedQueue);
}

function moveQueueItem(from: number, to: number) {
  const currentQueue = [...queueRef.current];
  const currentIndex = indexRef.current;

  // Only allow reordering upcoming songs.
  if (
    from <= currentIndex ||
    to <= currentIndex ||
    from >= currentQueue.length ||
    to >= currentQueue.length ||
    from === to
  ) {
    return;
  }

  const [movedTrack] = currentQueue.splice(from, 1);
  currentQueue.splice(to, 0, movedTrack);

  queueRef.current = currentQueue;
  setQueue(currentQueue);
  console.log(
  "Updated queue:",
  currentQueue.map((item) => item.title),
);

console.log("Current index:", currentIndex);
}

  return (
    <PlaybackContext.Provider
      value={{
        track,
        queue,
        queueIndex,
        loading,
        error,
        status,
        shuffle,
        repeatMode,
        loadTrack,
        playQueue,
        togglePlayback,
        seekTo,
        playNext,
        playPrevious,
        toggleShuffle,
        cycleRepeatMode,
        player,
        playQueueItem,
        removeFromQueue,
        moveQueueItem,
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
