import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";


export default function HomeScreen() {
  const router = useRouter();
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Good evening 👋</Text>

      <Text style={styles.heading}>Welcome to Melody</Text>

      <Text style={styles.subtitle}>
        Your music. Your mood. Your world.
      </Text>

      <Text style={styles.sectionTitle}>Recently Played</Text>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/player/[id]" as any,
            params: { id: "52469848-dfae-4a48-bbd8-c84354c97bf6" },
          } as any)
        }
      >
        <Text style={{ color: "white", fontSize: 18 }}>
          ▶ Play Low Fade
        </Text>
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your music journey starts here 🎵</Text>
        <Text style={styles.cardSubtitle}>
          Your recently played tracks will appear here.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Made for You</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Discover your next favourite</Text>
        <Text style={styles.cardSubtitle}>
          Personalized recommendations will appear here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 22,
  },
  greeting: {
    color: "#aaa",
    fontSize: 15,
    marginTop: 25,
  },
  heading: {
    color: "#fff",
    fontSize: 29,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: "#999",
    marginTop: 8,
    fontSize: 14,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 35,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#202020",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: "#999",
    fontSize: 13,
    marginTop: 8,
  },
});