
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams } from "expo-router";

import { usePlayback } from "../../context/playback.context";
import LikeButton from "@/components/LikeButton";
import { useRouter } from "expo-router";

export default function PlayerScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    track,
  loading,
  error,
  status,
  loadTrack,
  togglePlayback,
  seekTo,
  playNext,
  playPrevious,
  shuffle,
  toggleShuffle,
  repeatMode,
  cycleRepeatMode,
  queue
  } = usePlayback();

  useEffect(() => {
    if (!id) return;

  if (track?.id === id) return;

  // Only load the route track when no queue is active.
  if (queue.length > 1) return;

  loadTrack(id);
  }, [id]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  if (!track) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e11d48" />
        <Text style={styles.artist}>Loading music...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.artist}>{error}</Text>
      </View>
    );
  }

  const duration = status.duration || track.duration_seconds || 0;
  const currentTime = status.currentTime || 0;

  return (
    <>
      <Stack.Screen options={{ title: "Now Playing" }} />

      <View style={styles.container}>
        {track.coverUrl ? (
          <Image source={{ uri: track.coverUrl }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholder]}>
            <Text style={styles.placeholderIcon}>♪</Text>
          </View>
        )}

        <View style={styles.trackInfo}>
          <Text style={styles.title}>{track.title}</Text>
          <Text style={styles.artist}>
            {track.artist || "Unknown Artist"}
          </Text>
          <LikeButton trackId={track.id} />
        </View>

        {status.isBuffering && (
          <Text style={styles.buffering}>Buffering...</Text>
        )}

        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(duration, 1)}
          value={Math.min(currentTime, duration)}
          minimumTrackTintColor="#e11d48"
          maximumTrackTintColor="#444"
          thumbTintColor="#e11d48"
          onSlidingComplete={seekTo}
          disabled={!status.isLoaded || duration <= 0}
        />

        <View style={styles.timeRow}>
          <Text style={styles.artist}>{formatTime(currentTime)}</Text>
          <Text style={styles.artist}>{formatTime(duration)}</Text>
        </View>

        {/* Shuffle and Repeat */}
<View style={styles.extraControls}>
  <Pressable onPress={toggleShuffle}>
    <Text style={[styles.modeButton, shuffle && styles.activeMode]}>
      ⇄
    </Text>
  </Pressable>

  <Pressable onPress={cycleRepeatMode}>
    <Text
      style={[
        styles.modeButton,
        repeatMode !== "off" && styles.activeMode,
      ]}
    >
      {repeatMode === "one" ? "↻¹" : "↻"}
    </Text>
  </Pressable>
</View>
<Pressable onPress={() => router.push("/queue")}>
  <Text style={styles.modeButton}>☷</Text>
</Pressable>

{/* Previous, Play/Pause, Next */}
<View style={styles.controls}>
  <Pressable onPress={() => playPrevious()}>
    <Text style={styles.skip}>|◀</Text>
  </Pressable>

  <Pressable style={styles.playButton} onPress={togglePlayback}>
    <Text style={styles.playIcon}>
      {status.playing ? "Ⅱ" : "▶"}
    </Text>
  </Pressable>

  <Pressable onPress={() => playNext()}>
    <Text style={styles.skip}>▶|</Text>
  </Pressable>
</View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 340,
    alignSelf: "center",
    borderRadius: 18,
    marginBottom: 38,
  },
  placeholder: {
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    color: "#e11d48",
    fontSize: 100,
  },
  trackInfo: {
    gap: 8,
    marginBottom: 22,
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
  },
  artist: {
    color: "#aaa",
    fontSize: 14,
  },
  buffering: {
    color: "#e11d48",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
    marginTop: 28,
  },
  extraControls: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 35,
  marginTop: 18,
},
modeButton: {
  color: "#888",
  fontSize: 25,
},
activeMode: {
  color: "#e11d48",
},
  playButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#e11d48",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    color: "#fff",
    fontSize: 26,
  },
  skip: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
