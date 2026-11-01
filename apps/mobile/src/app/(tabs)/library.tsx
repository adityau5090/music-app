import { View, Text, StyleSheet } from "react-native";

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Library</Text>

      <View style={styles.card}>
        <Text style={styles.title}>❤️ Liked Songs</Text>
        <Text style={styles.subtitle}>Your favourite tracks</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>📁 Your Folders</Text>
        <Text style={styles.subtitle}>Organize your music</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>🎵 Playlists</Text>
        <Text style={styles.subtitle}>Your personal collections</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 22,
  },
  heading: {
    color: "#fff",
    fontSize: 29,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#202020",
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  subtitle: {
    color: "#999",
    marginTop: 7,
  },
});