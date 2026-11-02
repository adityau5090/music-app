
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useLocalSearchParams, Stack } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import { getPlaybackUrl } from "../../services/playback.service";
import { supabase } from "../../lib/supabase";

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadTrack() {
      try {
        setLoading(true);
        setError(null);

        const result = await getPlaybackUrl(id);

        if (cancelled) return;

        const coverStoragePath = (
          result.track as typeof result.track & {
            cover_storage_path?: string | null;
          }
        ).cover_storage_path;

        setTrack({
          ...result.track,
          coverUrl: result.track.cover_storage_path
            ? supabase.storage
                .from("covers")
                .getPublicUrl(result.track.cover_storage_path).data.publicUrl
            : null,
        });

        player.replace({ uri: result.playbackUrl });
        player.play();
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unable to load track";

          setError(message);
          Alert.alert("Playback error", message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) loadTrack();

    return () => {
      cancelled = true;
    };
  }, [id, player]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds)) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlayback = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e11d48" />
        <Text style={styles.message}>Loading your music...</Text>
      </View>
    );
  }

  if (error || !track) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          {error || "Track not found"}
        </Text>
      </View>
    );
  }

  const duration = status.duration || track.duration_seconds || 0;
  const currentTime = status.currentTime || 0;

  return (
    <>
      <Stack.Screen options={{ title: "Now Playing" }} />

      <View style={styles.container}>
        <View style={styles.coverContainer}>
          {track.coverUrl ? (
            <Image
              source={{ uri: track.coverUrl }}
              style={styles.cover}
            />
          ) : (
            <View style={[styles.cover, styles.placeholder]}>
              <Text style={styles.placeholderText}>♪</Text>
            </View>
          )}
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.title}>{track.title}</Text>
          <Text style={styles.artist}>
            {track.artist || "Unknown Artist"}
          </Text>
        </View>

        {status.isBuffering && (
          <Text style={styles.buffering}>Buffering...</Text>
        )}

        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(duration, 1)}
            value={Math.min(currentTime, duration || 0)}
            minimumTrackTintColor="#e11d48"
            maximumTrackTintColor="#444"
            thumbTintColor="#e11d48"
            onSlidingComplete={(value) => player.seekTo(value)}
            disabled={!status.isLoaded || duration <= 0}
          />

          <View style={styles.timeRow}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={() => player.seekTo(Math.max(0, currentTime - 10))}>
            <Text style={styles.skip}>-10</Text>
          </Pressable>

          <Pressable
            style={styles.playButton}
            onPress={togglePlayback}
            disabled={!status.isLoaded}
          >
            <Text style={styles.playIcon}>
              {status.playing ? "Ⅱ" : "▶"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => player.seekTo(Math.min(duration, currentTime + 10))}
          >
            <Text style={styles.skip}>+10</Text>
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
    padding: 24,
  },
  message: {
    color: "#fff",
    fontSize: 16,
  },
  coverContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  cover: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 340,
    borderRadius: 18,
  },
  placeholder: {
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#e11d48",
    fontSize: 100,
  },
  trackInfo: {
    gap: 8,
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "700",
  },
  artist: {
    color: "#aaa",
    fontSize: 16,
  },
  buffering: {
    color: "#e11d48",
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  time: {
    color: "#aaa",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
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
