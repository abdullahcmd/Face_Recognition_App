import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function FaceRecognitionScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [showHomeButton, setShowHomeButton] = useState(false);

  // 📸 Capture image using camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission required!");
      return;
    }

    Alert.alert(
      "Crop Image?",
      "Do you want to crop the captured image before uploading?",
      [
        {
          text: "No",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: false,
              quality: 1,
            });
            handleImageResult(result, true);
          },
        },
        {
          text: "Yes",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            handleImageResult(result, true);
          },
        },
      ]
    );
  };

  // 🖼️ Pick image from gallery
  const pickImage = async () => {
    Alert.alert(
      "Crop Image?",
      "Do you want to crop the selected image before uploading?",
      [
        {
          text: "No",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: false,
              quality: 1,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
            handleImageResult(result, false);
          },
        },
        {
          text: "Yes",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
            });
            handleImageResult(result, false);
          },
        },
      ]
    );
  };

  // 🧩 Common handler for selected/captured images
  const handleImageResult = (result, isCamera) => {
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setCameraMode(isCamera);
      setShowHomeButton(false);
    }
  };

  // 🚀 Send image to backend
  const recognizeFace = async () => {
    if (!image) return alert("Please select or capture an image first!");
    setLoading(true);
    setResult("");
    setShowHomeButton(false);

    const formData = new FormData();
    formData.append("file", {
      uri: image,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    try {
      // ⚙️ Replace with your LAN IP if running on physical device
      const res = await axios.post(
        "http://192.168.18.10:8000/recognize/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Api Resulttt-----------", res.data);
      const name = res.data?.result || "Unknown";
      setResult(`Recognized: ${name}`);
      setShowHomeButton(true);
    } catch (error) {
      console.log("Recognition error:", error);
      setResult("Recognition failed ❌");
      setShowHomeButton(true);
    } finally {
      setLoading(false);
      setCameraMode(false);
    }
  };

  // 🔄 Reset everything to default
  const reset = () => {
    setImage(null);
    setResult("");
    setCameraMode(false);
    setLoading(false);
    setShowHomeButton(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Face Recognition</Text>

      {/* Default Buttons (Camera + Gallery) */}
      {!image && !loading && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.optionButton} onPress={openCamera}>
            <Text style={styles.optionText}>📷 Open Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
            <Text style={styles.optionText}>🖼️ Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Preview + Buttons */}
      {image && (
        <View style={{ alignItems: "center" }}>
          <Image source={{ uri: image }} style={styles.image} />

          {cameraMode && !showHomeButton && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={reset}>
                <Text style={styles.optionText}>🔄 Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={recognizeFace}
              >
                <Text style={styles.optionText}>✅ Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {!cameraMode && !showHomeButton && (
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={recognizeFace}
              disabled={loading}
            >
              <Text style={styles.optionText}>Recognize Face</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Loader */}
      {loading && <ActivityIndicator size="large" color="#007bff" />}

      {/* Result + Home */}
      {result !== "" && !loading && (
        <>
          <Text style={styles.result}>{result}</Text>
          {showHomeButton && (
            <TouchableOpacity style={styles.homeBtn} onPress={reset}>
              <Text style={styles.optionText}>🏠 Go to Home Page</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 10,
  },
  optionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
    borderRadius: 15,
  },
  submitBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  retakeBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  homeBtn: {
    backgroundColor: "#17a2b8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  result: {
    fontSize: 18,
    marginTop: 20,
  },
});
