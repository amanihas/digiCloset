// HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { API_BASE } from "../api";

export default function HomeScreen({ setToken, navigation }) {
  const [username, setUsername] = useState("");
  const [token, setTokenState] = useState(null);
  const [clothes, setClothes] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [itemName, setItemName] = useState("");
  const [material, setMaterial] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const materialData = {
    Cotton: { carbon: 5, water: 10 },
    Polyester: { carbon: 10, water: 3 },
    Wool: { carbon: 7, water: 6 },
    Denim: { carbon: 8, water: 12 },
    Linen: { carbon: 4, water: 8 },
  };

  // ✅ Helper for image type compatibility
  const getMediaType = () => {
    if (ImagePicker.MediaType) return [ImagePicker.MediaType.photo];
    if (ImagePicker.MediaTypeOptions) return ImagePicker.MediaTypeOptions.Images;
    return "Images";
  };

  // Request camera & media permissions
  useEffect(() => {
    (async () => {
      const { status: cam } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: lib } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cam !== "granted" || lib !== "granted") {
        Alert.alert("Permission needed", "Camera and gallery access are required.");
      }
    })();
  }, []);

  // Load username, token and fetch closet from backend
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("username");
        const storedToken = await AsyncStorage.getItem("token");

        if (storedUser && storedToken) {
          setUsername(storedUser);
          setTokenState(storedToken);
          await fetchClothesFromBackend(storedToken);
        }
      } catch (err) {
        console.error("Initialize user error:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeUser();
  }, []);

  // Fetch clothes from backend
  const fetchClothesFromBackend = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE}/clothes`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setClothes(response.data);
    } catch (err) {
      console.error("Fetch clothes error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert("Session expired", "Please log in again");
        handleLogout();
      }
    }
  };

  // Refresh clothes list
  const handleRefresh = async () => {
    setRefreshing(true);
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      await fetchClothesFromBackend(storedToken);
    }
    setRefreshing(false);
  };

  // ✅ Image functions
  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: getMediaType(),
        quality: 1,
      });
      if (!result.canceled) setSelectedImage(result.assets[0].uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to open gallery");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: getMediaType(),
        quality: 1,
      });
      if (!result.canceled) setSelectedImage(result.assets[0].uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to take photo");
    }
  };

  // Add new clothing item to backend
  const addClothingItem = async () => {
    if (!selectedImage || !itemName.trim() || !material) {
      Alert.alert("Missing Info", "Please fill in all fields and add a photo.");
      return;
    }

    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        Alert.alert("Error", "Please log in again");
        handleLogout();
        return;
      }

      // Send clothing item to backend
      const response = await axios.post(
        `${API_BASE}/clothes`,
        {
          name: itemName.trim(),
          image: selectedImage,
          material: material,
          category: "N/A", // You can add a category picker later
        },
        {
          headers: { Authorization: `Bearer ${storedToken}` },
        }
      );

      // Add the new item from backend response to local state
      setClothes((prev) => [response.data, ...prev]);

      // Clear form
      setSelectedImage(null);
      setItemName("");
      setMaterial("");

      Alert.alert("Success", "Item added to your closet!");
    } catch (err) {
      console.error("Add clothing error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        Alert.alert("Session expired", "Please log in again");
        handleLogout();
      } else {
        Alert.alert("Error", err.response?.data?.msg || "Failed to add item");
      }
    }
  };

  // Delete clothing item
  const deleteClothingItem = async (itemId) => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (!storedToken) {
        Alert.alert("Error", "Please log in again");
        return;
      }

      await axios.delete(`${API_BASE}/clothes/${itemId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      // Remove from local state
      setClothes((prev) => prev.filter((item) => item._id !== itemId));
      Alert.alert("Success", "Item removed from your closet");
    } catch (err) {
      console.error("Delete clothing error:", err.response?.data || err.message);
      Alert.alert("Error", err.response?.data?.msg || "Failed to delete item");
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("username");
    setToken(null);
    navigation.replace("Login");
  };

  // ✅ Navigate to sustainability page
  const goToImpact = () => {
    navigation.navigate("Sustainability", { clothes, username });
  };

  // Render each item with delete option
  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMaterial}>🌿 {item.material}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            "Delete Item",
            `Remove "${item.name}" from your closet?`,
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteClothingItem(item._id) },
            ]
          );
        }}
      >
        <Text style={styles.deleteButtonText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Welcome, {username || "User"} 👋</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Upload Card */}
      <View style={styles.uploadCard}>
        <Text style={styles.subtitle}>Add New Clothing</Text>

        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <Text style={styles.placeholderText}>No image selected</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Enter item name (e.g. Blue Jeans)"
          placeholderTextColor="#888"
          value={itemName}
          onChangeText={setItemName}
        />

        {/* ✅ Material Picker */}
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={material}
            onValueChange={(value) => setMaterial(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select Material" value="" />
            <Picker.Item label="Cotton" value="Cotton" />
            <Picker.Item label="Polyester" value="Polyester" />
            <Picker.Item label="Recycled Fabric" value="Recycled Fabric" />
            <Picker.Item label="Denim" value="Denim" />
            <Picker.Item label="Linen" value="Linen" />
            <Picker.Item label="Wool" value="Wool" />
          </Picker>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Text style={styles.buttonText}>📸 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={pickFromGallery}>
            <Text style={styles.buttonText}>🖼 Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addClothingItem}>
          <Text style={styles.addButtonText}>+ Add to Closet</Text>
        </TouchableOpacity>
      </View>

      {/* Closet List */}
      <Text style={styles.sectionTitle}>Your Closet</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#a2d2ff" style={{ marginTop: 20 }} />
      ) : clothes.length === 0 ? (
        <Text style={styles.emptyText}>No items yet — start adding!</Text>
      ) : (
        <FlatList
          data={clothes}
          keyExtractor={(item) => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}

      {/* Sustainability Impact Button */}
      <TouchableOpacity style={styles.impactButton} onPress={goToImpact}>
        <Text style={styles.impactButtonText}>🌱 View Sustainability Impact</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fefbf6", padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#333" },
  logoutText: { color: "#e76f51", fontWeight: "600", fontSize: 16 },
  subtitle: { fontSize: 18, fontWeight: "600", color: "#444", marginBottom: 10 },
  uploadCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
    color: "#333",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginTop: 10,
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 180 : 50,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#d6e4e5",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: { fontWeight: "500", color: "#333" },
  addButton: {
    backgroundColor: "#a2d2ff",
    borderRadius: 12,
    marginTop: 15,
    paddingVertical: 10,
  },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
  previewImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginVertical: 10,
  },
  placeholderText: { color: "#aaa", textAlign: "center", marginVertical: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 8 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 10 },
  listContainer: { paddingBottom: 60 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  itemImage: { width: 60, height: 60, borderRadius: 10, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, color: "#333", fontWeight: "500" },
  itemMaterial: { fontSize: 14, color: "#666" },
  deleteButton: {
    padding: 8,
    backgroundColor: "#ffe5e5",
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  impactButton: {
    backgroundColor: "#90be6d",
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 10,
  },
  impactButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});
