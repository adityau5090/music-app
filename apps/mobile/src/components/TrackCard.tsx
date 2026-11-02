
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Track } from "../services/track.service";

interface Props {
  track: Track;
  onPress: () => void;
  loading?: boolean;
}

export default function TrackCard({
  track,
  onPress,
  loading = false,
}: Props) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {track.coverUrl ? (
        <Image source={{ uri: track.coverUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.placeholder]}>
          <Text style={styles.placeholderText}>♪</Text>
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

      {loading ? (
        <ActivityIndicator color="#e11d48" />
      ) : (
        <Text style={styles.play}>▶</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    gap: 13,
  },
  cover: {
    width: 54,
    height: 54,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#e11d48",
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  artist: {
    color: "#999",
    fontSize: 13,
  },
  play: {
    color: "#e11d48",
    fontSize: 18,
    paddingHorizontal: 8,
  },
});
