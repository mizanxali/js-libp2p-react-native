import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import "./globals-crypto.js";
import "./globals.js";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>js-libp2p running on React Native</Text>
      {/* <Text>Our PeerId is {libp2p?.peerId.toString()}</Text>
      <Text>Peers {peers?.join(", ")}</Text>
      <Text>Multiaddrs {multiaddrs?.join(", ")}</Text> */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
