import { View, Text, TextInput, StyleSheet } from "react-native";

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search</Text>

      <TextInput
        placeholder="What do you want to listen to?"
        placeholderTextColor="#888"
        style={styles.input}
      />

      <Text style={styles.subtitle}>
        Search for songs, artists and albums.
      </Text>
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
  input: {
    backgroundColor: "#242424",
    color: "#fff",
    padding: 17,
    borderRadius: 12,
    fontSize: 15,
  },
  subtitle: {
    color: "#999",
    marginTop: 20,
  },
});