
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import TrackCard from "../../components/TrackCard";
import {
  createFolder,
  deleteFolder,
  getFolders,
  getLikedTracks,
  MusicFolder,
} from "../../services/library.service";
import { Track } from "../../services/track.service";
import { usePlayback } from "../../context/playback.context";

export default function LibraryScreen() {
  const router = useRouter();
  const { loadTrack } = usePlayback();

  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchLibrary = useCallback(async () => {
    try {
      const [folderData, likedData] = await Promise.all([
        getFolders(),
        getLikedTracks(),
      ]);

      setFolders(folderData);
      setLikedTracks(likedData);
    } catch (error) {
      Alert.alert(
        "Library error",
        error instanceof Error ? error.message : "Unable to load library",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLibrary();
    }, [fetchLibrary]),
  );

  async function handleCreateFolder() {
    if (!folderName.trim()) return;

    try {
      setSaving(true);
      const folder = await createFolder(folderName);
      setFolders((current) => [folder, ...current]);
      setFolderName("");
    } catch (error) {
      Alert.alert(
        "Could not create folder",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFolder(folder: MusicFolder) {
    Alert.alert("Delete folder?", `Delete "${folder.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFolder(folder.id);
            setFolders((current) =>
              current.filter((item) => item.id !== folder.id),
            );
          } catch (error) {
            Alert.alert(
              "Error",
              error instanceof Error ? error.message : "Unable to delete",
            );
          }
        },
      },
    ]);
  }

  async function handlePlay(track: Track) {
    try {
      await loadTrack(track.id);
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
        <ActivityIndicator color="#e11d48" size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={likedTracks}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Your Library</Text>
          <Text style={styles.subtitle}>
            Your music, collected in one place.
          </Text>

          <Pressable
            style={styles.likedCard}
            onPress={() => router.push("/library/liked")}
          >
            <View style={styles.heartBox}>
              <Text style={styles.heart}>♥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.likedTitle}>Liked Songs</Text>
              <Text style={styles.likedSubtitle}>
                {likedTracks.length} songs
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Folders</Text>
            <Text style={styles.count}>{folders.length}</Text>
          </View>

          <View style={styles.createRow}>
            <TextInput
              value={folderName}
              onChangeText={setFolderName}
              placeholder="Create a new folder..."
              placeholderTextColor="#777"
              style={styles.input}
              maxLength={60}
              returnKeyType="done"
              onSubmitEditing={handleCreateFolder}
            />
            <Pressable
              style={styles.createButton}
              onPress={handleCreateFolder}
              disabled={saving || !folderName.trim()}
            >
              <Text style={styles.createButtonText}>
                {saving ? "..." : "+"}
              </Text>
            </Pressable>
          </View>

          {folders.length === 0 ? (
            <Text style={styles.empty}>No folders yet. Create one above.</Text>
          ) : (
            folders.map((folder) => (
              <View key={folder.id} style={styles.folderRow}>
                <Pressable
                  style={styles.folderMain}
                  onPress={() => router.push(`/folder/${folder.id}`)}
                >
                  <Text style={styles.folderIcon}>♫</Text>
                  <Text style={styles.folderName}>{folder.name}</Text>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>

                <Pressable onPress={() => handleDeleteFolder(folder)}>
                  <Text style={styles.delete}>•••</Text>
                </Pressable>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Recently liked</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TrackCard track={item} onPress={() => handlePlay(item)} />
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Your liked songs will appear here.
        </Text>
      }
    />
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
  heading: { color: "#fff", fontSize: 30, fontWeight: "800" },
  subtitle: { color: "#999", marginTop: 6, marginBottom: 24 },
  likedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    padding: 14,
    borderRadius: 14,
    gap: 14,
  },
  heartBox: {
    width: 54,
    height: 54,
    borderRadius: 9,
    backgroundColor: "#7f1d3d",
    alignItems: "center",
    justifyContent: "center",
  },
  heart: { color: "#fff", fontSize: 28 },
  likedTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  likedSubtitle: { color: "#aaa", fontSize: 12, marginTop: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 28,
    marginBottom: 14,
  },
  count: { color: "#888" },
  createRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#252525",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#fff",
    height: 48,
  },
  createButton: {
    width: 48,
    height: 48,
    backgroundColor: "#e11d48",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: { color: "#fff", fontSize: 28 },
  empty: { color: "#888", marginTop: 14, marginBottom: 8 },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  folderMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  folderIcon: { color: "#e11d48", fontSize: 24 },
  folderName: { flex: 1, color: "#fff", fontSize: 15 },
  arrow: { color: "#aaa", fontSize: 25 },
  delete: { color: "#aaa", padding: 10, fontSize: 17 },
});
