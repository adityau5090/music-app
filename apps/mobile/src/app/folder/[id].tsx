
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import TrackCard from "../../components/TrackCard";
import {
  addTrackToFolder,
  getFolderTracks,
  removeTrackFromFolder,
} from "../../services/library.service";
import { getTracks, Track } from "../../services/track.service";
import { usePlayback } from "../../context/playback.context";

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { loadTrack } = usePlayback();

  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [folderTracks, setFolderTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { playQueue } = usePlayback();

  const refresh = useCallback(async () => {
    try {
      const [all, folder] = await Promise.all([
        getTracks(1),
        getFolderTracks(id),
      ]);

      setAllTracks(all.tracks);
      setFolderTracks(folder);
    } catch (error) {
      Alert.alert(
        "Folder error",
        error instanceof Error ? error.message : "Unable to load folder",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function toggleTrack(track: Track) {
    const exists = folderTracks.some((item) => item.id === track.id);

    try {
      setBusyId(track.id);

      if (exists) {
        await removeTrackFromFolder(id, track.id);
        setFolderTracks((current) =>
          current.filter((item) => item.id !== track.id),
        );
      } else {
        await addTrackToFolder(id, track.id);
        setFolderTracks((current) => [...current, track]);
      }
    } catch (error) {
      Alert.alert(
        "Could not update folder",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setBusyId(null);
    }
  }

  
async function playFolder() {
  if (!folderTracks.length) {
    Alert.alert("Empty folder", "Add some songs first.");
    return;
  }

  try {
    await playQueue(folderTracks, 0);
    router.push(`/player/${folderTracks[0].id}`);
  } catch (error) {
    Alert.alert(
      "Playback error",
      error instanceof Error ? error.message : "Unable to play folder",
    );
  }
}

async function playTrack(track: Track) {
  try {
    await playQueue(folderTracks, folderTracks.findIndex(
      (item) => item.id === track.id,
    ));
    router.push(`/player/${track.id}`);
  } catch (error) {
    Alert.alert(
      "Playback error",
      error instanceof Error ? error.message : "Unable to play track",
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
    <>
      <Stack.Screen options={{ title: "Folder" }} />

      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={allTracks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Your Folder</Text>
            <Text style={styles.subtitle}>
              {folderTracks.length} songs added
            </Text>

            <Text style={styles.sectionTitle}>Songs in this folder</Text>

            {folderTracks.length === 0 && (
              <Text style={styles.empty}>
                This folder is empty. Add songs below.
              </Text>
            )}


            <Pressable style={styles.playAllButton} onPress={playFolder}>
  <Text style={styles.playAllText}>▶  Play all songs</Text>
</Pressable>
            {folderTracks.map((track) => (

              <View key={track.id} style={styles.trackRow}>
                <View style={{ flex: 1 }}>
                  <TrackCard
                    track={track}
                    onPress={() => playTrack(track)}
                  />
                </View>
                <Pressable onPress={() => toggleTrack(track)}>
                  <Text style={styles.remove}>−</Text>
                </Pressable>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Add songs</Text>
          </View>
        }
        renderItem={({ item }) => {
          const added = folderTracks.some((track) => track.id === item.id);

          return (
            <View style={styles.trackRow}>
              <View style={{ flex: 1 }}>
                <TrackCard
                  track={item}
                  onPress={() => playTrack(item)}
                />
              </View>
              <Pressable
                onPress={() => toggleTrack(item)}
                disabled={busyId === item.id}
              >
                <Text style={styles.add}>
                  {busyId === item.id ? "…" : added ? "✓" : "+"}
                </Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>No uploaded tracks available.</Text>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  content: { padding: 20, paddingBottom: 150 },
  center: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { color: "#fff", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#999", marginTop: 7 },
  sectionTitle: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 12,
  },
  empty: { color: "#888", marginVertical: 12 },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  add: { color: "#e11d48", fontSize: 27, paddingHorizontal: 8 },
  remove: { color: "#f87171", fontSize: 28, paddingHorizontal: 8 },
  playAllButton: {
  backgroundColor: "#e11d48",
  padding: 15,
  borderRadius: 12,
  alignItems: "center",
  marginTop: 20,
},
playAllText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "700",
},
});
