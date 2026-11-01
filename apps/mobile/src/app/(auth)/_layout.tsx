import { Stack, router } from "expo-router";
import { View, ActivityIndicator } from "react-native"
import { useAuth } from "../../context/auth.context"
import { useEffect } from "react"

export default function AuthLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if(!loading && user){
      router.replace('/(tabs)');
    }
  }, [user, loading])

  if(loading || user){
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
      </View>
    )
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}