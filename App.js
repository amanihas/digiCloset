import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

const API_URL = "http://192.168.1.220:5000/api/clothes"; // change YOUR_LOCAL_IP

export default function App() {
  const [clothes, setClothes] = useState([]);
  const [category, setCategory] = useState("");

  // Fetch clothes from backend
  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClothes(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not load clothes from backend.");
    }
  };

  // Add clothing item
  const addClothing = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      try {
        const res = await axios.post(API_URL, {
          uri: result.assets[0].uri,
          wears: 0,
          category: category || "Uncategorized",
        });
        setClothes([...clothes, res.data]);
        setCategory("");
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Could not save clothing.");
      }
    }
  };

  // Increase wears
  const increaseWears = async (item) => {
    try {
      const res = await axios.put(`${API_URL}/${item._id}`, {
        wears: item.wears + 1,
        category: item.category,
      });
      setClothes(clothes.map(c => (c._id === item._id ? res.data : c)));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not update wears.");
    }
  };

  // Delete clothing
  const deleteClothing = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setClothes(clothes.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not delete clothing.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👕 My Digital Closet</Text>

      <TextInput
        placeholder="Enter category"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={addClothing}>
        <Text style={styles.buttonText}>Add Clothing</Text>
      </TouchableOpacity>

      <FlatList
        data={clothes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <Text>{item.category}</Text>
            <Text>Worn: {item.wears} times</Text>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => increaseWears(item)}
              >
                <Text style={styles.smallButtonText}>+1 Wear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, { backgroundColor: "#b85c5c" }]}
                onPress={() => deleteClothing(item._id)}
              >
                <Text style={styles.smallButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "#F5F5DC" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333333", marginBottom: 10 },
  input: { 
    borderWidth: 1, borderColor: "#ccc", borderRadius: 8, 
    padding: 8, width: "100%", marginBottom: 10, backgroundColor: "#fff"
  },
  button: {
    backgroundColor: "#9CAF88",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  item: {
    marginTop: 15,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    padding: 15,
    width: "100%",
  },
  image: { width: 120, height: 120, borderRadius: 10, marginBottom: 10 },
  smallButton: {
    backgroundColor: "#9CAF88",
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 5,
  },
  smallButtonText: { color: "#fff", fontWeight: "bold" },
});
