
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import TrackCard from "../../components/TrackCard";
import { getLikedTracks } from "../../services/library.service";
import { Track } from "../../services/track.service";
import { usePlayback } from "../../context/playback.context";

export default function LikedSongsScreen() {
  const router = useRouter();
  const { loadTrack } = usePlayback();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getLikedTracks()
        .then(setTracks)
        .catch((error) =>
          Alert.alert("Error", error.message || "Unable to load liked songs"),
        )
        .finally(() => setLoading(false));
    }, []),
  );

  async function playTrack(track: Track) {
    try {
      await loadTrack(track.id);
      router.push(`/player/${track.id}`);
    } catch (error) {
      Alert.alert(
        "Playback error",
        error instanceof Error ? error.message : "Unable to play",
      );
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e11d48" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>♥ Liked Songs</Text>
      <Text style={styles.subtitle}>{tracks.length} songs</Text>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackCard track={item} onPress={() => playTrack(item)} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No liked songs yet. Like a track from the player.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  center: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { color: "#fff", fontSize: 27, fontWeight: "800" },
  subtitle: { color: "#999", marginTop: 8, marginBottom: 20 },
  empty: { color: "#888", marginTop: 30, textAlign: "center" },
});
