import React, { useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import FaceRecognitionScreen from "./src/screens/facialRecognitionScreen";
export default function App() {
  const [count, setCount] = useState(0);

  return <FaceRecognitionScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
  },
  count: {
    fontSize: 28,
    marginVertical: 10,
    fontWeight: "600",
    color: "#007AFF",
  },
  buttonContainer: {
    marginTop: 20,
    width: "60%",
  },
});
