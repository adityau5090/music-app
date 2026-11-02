import { Stack } from "expo-router";
import {AuthProvider} from "../context/auth.context";
import { PlaybackProvider } from "../context/playback.context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlaybackProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen
              name="player/[id]"
              options={{
                headerShown: true,
                title: "Now Playing",
              }}
            />
          </Stack>
      </PlaybackProvider>
    </AuthProvider>
  ) 
}
