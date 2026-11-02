
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import TrackCard from "../../components/TrackCard";
import { getTracks, Track } from "../../services/track.service";
import { usePlayback } from "../../context/playback.context";

export default function SearchScreen() {
  const router = useRouter();
  const { loadTrack } = usePlayback();

  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getTracks(1, query);

        if (!cancelled) {
          setTracks(result.tracks);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Search failed",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

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
      <Text style={styles.heading}>Search</Text>
      <Text style={styles.subtitle}>Find your next favourite track.</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Songs, artists, albums..."
        placeholderTextColor="#777"
        style={styles.input}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {loading && (
        <ActivityIndicator
          color="#e11d48"
          style={styles.loader}
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TrackCard
            track={item}
            loading={playingId === item.id}
            onPress={() => handlePlay(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              {query.trim()
                ? "No tracks found. Try another search."
                : "No tracks available yet."}
            </Text>
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
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  heading: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#999",
    marginTop: 6,
    marginBottom: 22,
  },
  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#252525",
    color: "#fff",
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 18,
  },
  loader: {
    marginBottom: 12,
  },
  list: {
    paddingBottom: 140,
  },
  empty: {
    color: "#888",
    textAlign: "center",
    marginTop: 35,
  },
  error: {
    color: "#f87171",
    marginBottom: 12,
  },
});
