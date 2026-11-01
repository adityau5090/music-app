import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/auth.context";

export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/(tabs)" : "/(auth)/login");
    }
  }, [user, loading]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#101010",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator color="#1ed760" size="large" />
      <Text style={{ color: "#fff", marginTop: 12 }}>Loading Melody...</Text>
    </View>
  );
}