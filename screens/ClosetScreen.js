// screens/ClosetScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { fetchClothes, createClothing, API_BASE } from "../api";
import { globalStyles, colors } from "../styles";

const CLOUDINARY_NAME = "dbmfhqhjh"; // <-- replace if different
const UPLOAD_PRESET = "digiCloset"; // <-- your unsigned preset

export default function ClosetScreen({ token, setToken }) {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    try {
      const res = await fetchClothes(token);
      setClothes(res.data || []);
    } catch (err) {
      console.log("Fetch clothes error:", err.response?.data || err.message);
      Alert.alert("Error", "Could not load your clothes.");
    }
  };

  // Request permissions (media library + camera)
  const ensurePermissions = async () => {
    try {
      const media = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (media.status !== "granted") {
        Alert.alert("Permission required", "Please allow photo access in Settings.");
        return false;
      }
      const cam = await ImagePicker.requestCameraPermissionsAsync();
      if (cam.status !== "granted") {
        Alert.alert("Permission required", "Please allow camera access in Settings.");
        return false;
      }
      return true;
    } catch (err) {
      console.error("Permission error:", err);
      return false;
    }
  };

  // Pick from gallery
  const pickFromGallery = async () => {
    try {
      // ensure permission first (optional - request again)
      const mediaPerm = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!mediaPerm.granted) {
        const r = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (r.status !== "granted") {
          Alert.alert("Permission denied", "Please enable photo permissions in Settings.");
          return;
        }
      }

      // NOTE: We purposely do NOT reference ImagePicker.MediaTypeOptions or ImagePicker.MediaType
      // because some versions of expo-image-picker don't export those constants.
      // This call will open the gallery. Default behavior returns picked images.
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        // no mediaTypes field here to avoid 'Images' property errors across versions
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const uri = result.assets[0].uri;
      await uploadAndCreate(uri);
    } catch (err) {
      console.error("pickFromGallery error:", err);
      Alert.alert("Error", "Could not pick image.");
    }
  };

  // Take a photo
  const takePhoto = async () => {
    try {
      const camPerm = await ImagePicker.getCameraPermissionsAsync();
      if (!camPerm.granted) {
        const r = await ImagePicker.requestCameraPermissionsAsync();
        if (r.status !== "granted") {
          Alert.alert("Permission denied", "Please enable camera permissions in Settings.");
          return;
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        // no mediaTypes here either
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const uri = result.assets[0].uri;
      await uploadAndCreate(uri);
    } catch (err) {
      console.error("takePhoto error:", err);
      Alert.alert("Error", "Could not take photo.");
    }
  };

  // Upload to Cloudinary and then create clothing item in backend
  const uploadAndCreate = async (uri) => {
    if (!uri) return;
    setLoading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(uri);
      const res = await createClothing(token, { name: "New Item", image: uploadedUrl });
      setClothes((prev) => [...prev, res.data]);
    } catch (err) {
      console.log("uploadAndCreate error:", err.response?.data || err.message);
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Cloudinary unsigned upload
  const uploadToCloudinary = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;
    const resp = await fetch(url, { method: "POST", body: formData });
    const data = await resp.json();
    if (!data.secure_url) {
      console.error("Cloudinary upload failed", data);
      throw new Error("Cloudinary upload failed");
    }
    return data.secure_url;
  };

  const onAddPress = () => {
    Alert.alert("Add Clothing", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Pick from Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
  };

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: 5 }}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: "100%", height: 150, borderRadius: 10, backgroundColor: colors.white }} />
      ) : (
        <View style={{ width: "100%", height: 150, borderRadius: 10, backgroundColor: "#eee" }} />
      )}
      <Text style={{ textAlign: "center", marginTop: 5 }}>{item.name}</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Your Closet 👕</Text>

      <FlatList data={clothes} keyExtractor={(item) => item._id} numColumns={2} renderItem={renderItem} />

      <TouchableOpacity style={globalStyles.button} onPress={onAddPress} disabled={loading}>
        <Text style={globalStyles.buttonText}>{loading ? "Adding..." : "➕ Add Clothing"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: colors.textDark, marginTop: 15, textAlign: "center" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
