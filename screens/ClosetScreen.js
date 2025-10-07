import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { fetchClothes, addClothing } from "../api";
import { globalStyles, colors } from "../styles";

export default function ClosetScreen({ token, setToken }) {
  const [clothes, setClothes] = useState([]);

  const loadClothes = async () => {
    try {
      const res = await fetchClothes(token);
      setClothes(res.data);
    } catch {
      Alert.alert("Error", "Could not load your clothes.");
    }
  };

  const handleAddClothing = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const imageBase64 = `data:image/jpg;base64,${result.assets[0].base64}`;
        const res = await addClothing(token, {
          name: "New Item",
          image: imageBase64,
        });
        setClothes((prev) => [...prev, res.data]);
      } catch (err) {
        Alert.alert("Upload failed", err.response?.data?.msg || "Try again later.");
      }
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
  };

  useEffect(() => {
    loadClothes();
  }, []);

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Your Closet 👕</Text>

      <FlatList
        data={clothes}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={{ flex: 1, margin: 5 }}>
            <Image
              source={{ uri: item.image }}
              style={{
                width: "100%",
                height: 150,
                borderRadius: 10,
                backgroundColor: colors.white,
              }}
            />
            <Text style={{ textAlign: "center", marginTop: 5 }}>{item.name}</Text>
          </View>
        )}
      />

      <TouchableOpacity style={globalStyles.button} onPress={handleAddClothing}>
        <Text style={globalStyles.buttonText}>➕ Add Clothing</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={{ color: colors.textDark, marginTop: 15, textAlign: "center" }}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}
