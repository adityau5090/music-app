import { useMemo } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";

import { usePlayback } from "../context/playback.context";

export default function QueueScreen() {
  const router = useRouter();

  const {
    track,
    queue,
    queueIndex,
    status,
    playQueueItem,
    removeFromQueue,
    moveQueueItem,
  } = usePlayback();

  const upcoming = useMemo(
    () => queue.slice(queueIndex + 1),
    [queue, queueIndex],
  );

  async function handlePlay(index: number) {
    try {
      await playQueueItem(index);
      router.replace(`/player/${queue[index].id}`);
    } catch (error) {
      Alert.alert(
        "Playback error",
        error instanceof Error ? error.message : "Unable to play song",
      );
    }
  }

  function handleRemove(index: number) {
    Alert.alert("Remove song?", "Remove this song from your queue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromQueue(index),
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: "Up Next" }} />

      <View style={styles.container}>
        <Text style={styles.heading}>Queue</Text>
        <Text style={styles.subtitle}>
          {upcoming.length} upcoming songs
        </Text>

        <Text style={styles.sectionTitle}>Now Playing</Text>

        {track && (
          <View style={styles.currentCard}>
            {track.coverUrl ? (
  <Image source={{ uri: track.coverUrl }} style={styles.cover} />
) : (
  <View style={styles.cover}>
    <Text style={styles.coverIcon}>♫</Text>
  </View>
)}

            <View style={styles.info}>
              <Text style={styles.currentTitle} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {track.artist || "Unknown Artist"}
              </Text>
            </View>

            <Text style={styles.playing}>
              {status.playing ? "PLAYING" : "PAUSED"}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Next Up</Text>

        <FlatList
          data={upcoming}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const actualIndex = queueIndex + 1 + index;

            return (
              <View style={styles.songRow}>
                <Pressable
                  style={styles.songInfo}
                  onPress={() => handlePlay(actualIndex)}
                >
                  {item.coverUrl ? (
                    <View style={styles.cover}>
                      <Text style={styles.coverIcon}>♫</Text>
                    </View>
                  ) : (
                    <View style={styles.cover}>
                      <Text style={styles.coverIcon}>♫</Text>
                    </View>
                  )}

                  <View style={styles.info}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.artist} numberOfLines={1}>
                      {item.artist || "Unknown Artist"}
                    </Text>
                  </View>
                </Pressable>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() =>
                      moveQueueItem(actualIndex, actualIndex - 1)
                    }
                    disabled={actualIndex === queueIndex + 1}
                  >
                    <Text style={styles.action}>↑</Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      moveQueueItem(actualIndex, actualIndex + 1)
                    }
                    disabled={actualIndex === queue.length - 1}
                  >
                    <Text style={styles.action}>↓</Text>
                  </Pressable>

                  <Pressable onPress={() => handleRemove(actualIndex)}>
                    <Text style={styles.remove}>×</Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No upcoming songs. Play a folder to fill your queue.
            </Text>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
  },
  heading: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: "#999",
    marginTop: 6,
    marginBottom: 25,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 14,
    marginTop: 12,
  },
  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 7,
    backgroundColor: "#3a2029",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverIcon: {
    color: "#e11d48",
    fontSize: 25,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  currentTitle: {
    color: "#e11d48",
    fontWeight: "700",
    fontSize: 15,
  },
  title: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  artist: {
    color: "#999",
    fontSize: 12,
  },
  playing: {
    color: "#e11d48",
    fontSize: 9,
    fontWeight: "800",
  },
  list: {
    paddingBottom: 120,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    gap: 8,
  },
  songInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  action: {
    color: "#ccc",
    fontSize: 21,
    padding: 3,
  },
  remove: {
    color: "#f87171",
    fontSize: 25,
    paddingHorizontal: 3,
  },
  empty: {
    color: "#888",
    textAlign: "center",
    marginTop: 30,
    lineHeight: 22,
  },
});
