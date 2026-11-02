
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import MiniPlayer from "../../components/MiniPlayer";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#e11d48",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            height: 65,
            backgroundColor: "#181818",
            borderTopColor: "#292929",
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="library"
          options={{
            title: "Library",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="library" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          bottom: 65,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <MiniPlayer />
      </View>
    </View>
  );
}
