import { Stack } from "expo-router";
import {AuthProvider} from "../context/auth.context";
import { PlaybackProvider } from "../context/playback.context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlaybackProvider>
          <Stack />
      </PlaybackProvider>
    </AuthProvider>
  ) 
}
