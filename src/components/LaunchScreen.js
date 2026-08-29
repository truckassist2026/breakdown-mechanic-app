import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, View } from "react-native";

export default function LaunchScreen() {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Image
        source={require("../../assets/images/splash-icon.png")}
        style={styles.fullscreen}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    width: "100%",
    height: "100%",
  },
});
