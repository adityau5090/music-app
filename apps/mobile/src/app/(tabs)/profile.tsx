import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/auth.context";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert(
        "Sign out failed",
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Profile</Text>

      <View style={styles.card}>
        <Text style={styles.avatar}>👤</Text>

        <Text style={styles.name}>
          {user?.user_metadata?.full_name || "Melody User"}
        </Text>

        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </Pressable>
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
    padding: 25,
    borderRadius: 16,
    alignItems: "center",
  },
  avatar: {
    fontSize: 55,
  },
  name: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
    marginTop: 12,
  },
  email: {
    color: "#999",
    marginTop: 8,
  },
  button: {
    backgroundColor: "#292929",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#ff5555",
    fontWeight: "bold",
    fontSize: 15,
  },
});