import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { fetchClothes, createClothing, API_BASE } from "../api";
import { globalStyles, colors } from "../styles";

const CLOUDINARY_NAME = "dbmfhqhjh"; // replace with your cloud name
const UPLOAD_PRESET = "digiClosetPreset"; // your unsigned preset

export default function ClosetScreen({ token, setToken }) {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadClothes = async () => {
    try {
      const res = await fetchClothes(token);
      setClothes(res.data);
    } catch (err) {
      console.log("Fetch clothes error:", err.response?.data || err.message);
      Alert.alert("Error", "Could not load your clothes.");
    }
  };

  useEffect(() => {
    loadClothes();
  }, []);

  const uploadToCloudinary = async (uri) => {
    // Cloudinary client-side unsigned upload
    const data = new FormData();
    data.append("file", { uri, type: "image/jpeg", name: "upload.jpg" });
    data.append("upload_preset", digiCloset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${dbmfhqhjh}/image/upload`, {
      method: "POST",
      body: data,
    });
    const file = await res.json();
    if (!file.secure_url) throw new Error("Cloudinary upload failed");
    return file.secure_url;
  };

  const handleAddClothing = async () => {
    // Ask for permissions is handled by expo; ensure configured in app.json if needed
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;
    try {
      setLoading(true);
      const uri = result.assets[0].uri;
      const uploadedUrl = await uploadToCloudinary(uri);

      // create clothing in backend
      const res = await createClothing(token, { name: "New Item", image: uploadedUrl });
      setClothes((prev) => [...prev, res.data]);
    } catch (err) {
      console.log("Add clothing error:", err.response?.data || err.message);
      Alert.alert("Upload failed", "Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
  };

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, margin: 5 }}>
      <Image source={{ uri: item.image }} style={{ width: "100%", height: 150, borderRadius: 10, backgroundColor: colors.white }} />
      <Text style={{ textAlign: "center", marginTop: 5 }}>{item.name}</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Your Closet 👕</Text>

      <FlatList data={clothes} keyExtractor={(item) => item._id} numColumns={2} renderItem={renderItem} />

      <TouchableOpacity style={globalStyles.button} onPress={handleAddClothing} disabled={loading}>
        <Text style={globalStyles.buttonText}>{loading ? "Adding..." : "➕ Add Clothing"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: colors.textDark, marginTop: 15, textAlign: "center" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
