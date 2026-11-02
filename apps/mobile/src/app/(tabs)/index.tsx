
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import TrackCard from "../../components/TrackCard";
import { getTracks, Track } from "../../services/track.service";
import { usePlayback } from "../../context/playback.context";

export default function HomeScreen() {
  const router = useRouter();
  const { loadTrack } = usePlayback();

  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTracks = useCallback(async () => {
    try {
      setError("");
      const result = await getTracks(1);
      setTracks(result.tracks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  async function handlePlay(track: Track) {
    try {
      setPlayingId(track.id);
      await loadTrack(track.id);
      router.push(`/player/${track.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to play track");
    } finally {
      setPlayingId(null);
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchTracks();
            }}
            tintColor="#e11d48"
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.greeting}>YOUR SOUND. YOUR WORLD.</Text>
            <Text style={styles.heading}>Good music,</Text>
            <Text style={styles.heading}>good mood.</Text>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently added</Text>
              <Text style={styles.count}>{tracks.length} tracks</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <TrackCard
            track={item}
            loading={playingId === item.id}
            onPress={() => handlePlay(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator color="#e11d48" size="large" />
            ) : (
              <Text style={styles.message}>
                {error || "No music uploaded yet."}
              </Text>
            )}
          </View>
        }
        ListFooterComponent={
          error && tracks.length > 0 ? (
            <Text style={styles.error}>{error}</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 150,
  },
  header: {
    marginBottom: 18,
  },
  greeting: {
    color: "#e11d48",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  heading: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 34,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  count: {
    color: "#888",
    fontSize: 12,
  },
  empty: {
    paddingTop: 50,
    alignItems: "center",
  },
  message: {
    color: "#aaa",
  },
  error: {
    color: "#f87171",
    marginTop: 12,
  },
});
