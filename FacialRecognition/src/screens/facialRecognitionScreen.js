import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

export default function FaceRecognitionScreen() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [showHomeButton, setShowHomeButton] = useState(false);
  const [attendanceVisible, setAttendanceVisible] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);

  const backendUrl = "http://192.168.18.23:8000"; // ⚙️ Replace with your LAN IP if needed

  // 📸 Capture image using camera
  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Camera permission required!");
      return;
    }

    Alert.alert("Crop Image?", "Do you want to crop the captured image?", [
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
    ]);
  };

  // 🖼️ Pick image from gallery
  const pickImage = async () => {
    Alert.alert("Crop Image?", "Do you want to crop the image?", [
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
    ]);
  };

  // 🧩 Common handler
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
      const res = await axios.post(`${backendUrl}/recognize/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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

  // 🧾 Fetch attendance (only show records that have a valid date)
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/attendance/`);

      // Filter out entries without LastMarked date
      const validData = (res.data.attendance || []).filter(
        (item) => item.LastMarked && item.LastMarked.trim() !== ""
      );

      setAttendanceData(validData);
      setAttendanceVisible(true);
    } catch (error) {
      console.log("Error fetching attendance:", error);
      alert("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Reset all
  const reset = () => {
    setImage(null);
    setResult("");
    setCameraMode(false);
    setLoading(false);
    setShowHomeButton(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={"dark-content"} />
      <Text style={styles.title}>Smart Attendance System</Text>

      {/* 🏠 Home buttons */}
      {!image && !loading && (
        <View style={styles.homeCard}>
          <Text style={styles.subtitle}>
            Mark attendance with face recognition or view attendance records.
          </Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryBtn} onPress={openCamera}>
              <Text style={styles.optionText}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.attendanceBtn}
              onPress={fetchAttendance}
            >
              <Text style={styles.optionText}>View Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Image + Actions */}
      {image && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: image }} style={styles.image} />

          {cameraMode && !showHomeButton && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.retakeBtn} onPress={reset}>
                <Text style={styles.optionText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={recognizeFace}
              >
                <Text style={styles.optionText}>Submit</Text>
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

      {/* Result */}
      {result !== "" && !loading && (
        <>
          <Text style={styles.result}>{result}</Text>
          <View style={{ flexDirection: "row", marginTop: 15 }}>
            <TouchableOpacity style={styles.homeBtn} onPress={reset}>
              <Text style={styles.optionText}>Go Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewAttendanceBtn}
              onPress={fetchAttendance}
            >
              <Text style={styles.optionText}>View Attendance</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* 🧾 Attendance Modal */}
      <Modal
        visible={attendanceVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setAttendanceVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Attendance Records</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {attendanceData.length > 0 ? (
                attendanceData.map((item, index) => (
                  <View key={index} style={styles.attendanceCard}>
                    <Text style={styles.attendanceName}>{item.Name}</Text>
                    <Text
                      style={[
                        styles.attendanceStatus,
                        {
                          color:
                            item.Status === "Present" ? "#28a745" : "#dc3545",
                        },
                      ]}
                    >
                      {item.Status}
                    </Text>
                    <Text style={styles.attendanceTime}>{item.LastMarked}</Text>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", marginTop: 10 }}>
                  No records found
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setAttendanceVisible(false)}
            >
              <Text style={styles.optionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 Enhanced Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef3f9",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1d3557",
    marginBottom: 25,
  },
  subtitle: {
    textAlign: "center",
    color: "#6c757d",
    marginBottom: 20,
    fontSize: 15,
  },
  homeCard: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 18,
    elevation: 5,
    width: "90%",
    alignItems: "center",
  },
  buttonGroup: {
    gap: 12,
    width: "100%",
  },
  primaryBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtn: {
    backgroundColor: "#17a2b8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  attendanceBtn: {
    backgroundColor: "#6f42c1",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "90%",
    elevation: 5,
  },
  image: {
    width: 270,
    height: 270,
    marginVertical: 20,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: "#007bff",
  },
  submitBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  retakeBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  result: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    marginTop: 10,
  },
  homeBtn: {
    backgroundColor: "#17a2b8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  viewAttendanceBtn: {
    backgroundColor: "#6f42c1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  // 🧾 Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    width: "90%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    color: "#007bff",
  },
  attendanceCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  attendanceName: {
    flex: 1,
    fontWeight: "600",
    color: "#333",
  },
  attendanceStatus: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
  },
  attendanceTime: {
    flex: 1,
    textAlign: "right",
    color: "#555",
  },
  closeBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
});
