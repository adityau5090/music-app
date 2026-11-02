
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { usePlayback } from "../context/playback.context";

export default function MiniPlayer() {
  const router = useRouter();
  const { track, status, loading, togglePlayback } = usePlayback();

  if (!track) return null;

  return (
    <Pressable
      style={styles.container}
      onPress={() => router.push(`/player/${track.id}`)}
    >
      {track.coverUrl ? (
        <Image source={{ uri: track.coverUrl }} style={styles.cover} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>♪</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {track.artist || "Unknown Artist"}
        </Text>
      </View>

      <Pressable
        style={styles.control}
        onPress={(event) => {
          event.stopPropagation();
          togglePlayback();
        }}
        disabled={loading}
      >
        <Text style={styles.controlText}>
          {loading ? "…" : status.playing ? "Ⅱ" : "▶"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 62,
    backgroundColor: "#282828",
    borderRadius: 12,
    marginHorizontal: 10,
    marginBottom: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cover: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  placeholder: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    color: "#fff",
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  artist: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 3,
  },
  control: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  controlText: {
    color: "#fff",
    fontSize: 22,
  },
});
