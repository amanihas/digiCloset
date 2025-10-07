import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const API_URL = "http://192.168.1.220:5000/api/clothes";

export default function ClosetScreen({ token, onLogout }) {
  const [clothes, setClothes] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);

  const fetchClothes = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setClothes(res.data);
    } catch (err) {
      console.error("Error fetching clothes", err);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const addClothing = async () => {
    if (!name) return Alert.alert("Error", "Please enter a clothing name");
    try {
      const res = await axios.post(API_URL, { name, image }, { headers: { Authorization: `Bearer ${token}` } });
      setClothes([...clothes, res.data]);
      setName("");
      setImage(null);
    } catch (err) {
      console.error("Error adding clothing", err);
    }
  };

  const incrementWear = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setClothes(clothes.map((c) => (c._id === id ? res.data : c)));
    } catch (err) {
      console.error("Error updating wear", err);
    }
  };

  const deleteClothing = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setClothes(clothes.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting clothing", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👕 digiCloset</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <TextInput style={styles.input} placeholder="Enter clothing name" value={name} onChangeText={setName} />

      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={addClothing}>
        <Text style={styles.buttonText}>Add</Text>
      </TouchableOpacity>

      <FlatList
        data={clothes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
            <Text style={styles.itemName}>{item.name}</Text>
            <Text>Times worn: {item.timesWorn}</Text>
            <Text>Sustainability Score: {item.sustainabilityScore}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => incrementWear(item._id)}>
                <Text style={styles.actionText}>+ Wear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteClothing(item._id)}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5DC", padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#556B2F", textAlign: "center", marginBottom: 10 },
  logoutButton: { backgroundColor: "#B22222", padding: 10, borderRadius: 8, marginBottom: 10 },
  logoutText: { color: "#fff", textAlign: "center" },
  input: { backgroundColor: "#fff", padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#556B2F", padding: 10, borderRadius: 8, marginVertical: 5 },
  buttonText: { color: "#fff", textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 15 },
  image: { width: "100%", height: 150, borderRadius: 10, marginBottom: 10 },
  actions: { flexDirection: "row", justifyContent: "space-between" },
  actionButton: { backgroundColor: "#556B2F", padding: 8, borderRadius: 6 },
  deleteButton: { backgroundColor: "#B22222", padding: 8, borderRadius: 6 },
  actionText: { color: "#fff" },
});
