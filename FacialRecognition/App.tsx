import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native";
import FaceRecognitionScreen from "./src/screens/facialRecognitionScreen";

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in animation for the splash text
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Splash screen timeout (2 seconds)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <Animated.Text style={[styles.splashTitle, { opacity: fadeAnim }]}>
          Face Recognition App
        </Animated.Text>
        <Text style={styles.splashSubtitle}>Powered by AI</Text>
      </View>
    );
  }

  return <FaceRecognitionScreen />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007bff",
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
    color: "#e0e0e0",
    fontStyle: "italic",
  },
});
