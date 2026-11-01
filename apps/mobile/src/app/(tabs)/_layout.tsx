import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Tabs, router } from "expo-router";
import { useAuth } from "../../context/auth.context";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [user, loading]);

  if (loading || !user) {
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
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#181818",
          borderTopColor: "#282828",
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#1ed760",
        tabBarInactiveTintColor: "#888",
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
          tabBarLabel: "Home",
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
        }}
      />

      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarLabel: "Library",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  );
}