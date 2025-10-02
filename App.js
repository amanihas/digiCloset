import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

// Change this to your computer's local IP
const API_URL = "http://192.168.1.220:5000/api/clothes";

export default function App() {
  const [clothes, setClothes] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);

  // Fetch clothes on load
  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const res = await axios.get(API_URL);
      setClothes(res.data);
    } catch (err) {
      console.error("Error fetching clothes", err);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const addClothing = async () => {
    if (!name) return Alert.alert("Error", "Please enter a clothing name");

    try {
      const res = await axios.post(API_URL, { name, image });
      setClothes([...clothes, res.data]);
      setName("");
      setImage(null);
    } catch (err) {
      console.error("Error adding clothing", err);
    }
  };

  const incrementWear = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`);
      setClothes(clothes.map((c) => (c._id === id ? res.data : c)));
    } catch (err) {
      console.error("Error updating wear", err);
    }
  };

  const deleteClothing = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setClothes(clothes.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting clothing", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👕 digiCloset</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter clothing name"
          value={name}
          onChangeText={setName}
        />
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>Pick Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={addClothing}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={clothes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.image} />
            ) : null}
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.text}>Times worn: {item.timesWorn}</Text>
            <Text style={styles.text}>
              Sustainability Score: {item.sustainabilityScore}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => incrementWear(item._id)}
              >
                <Text style={styles.actionText}>+ Wear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteClothing(item._id)}
              >
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
  container: {
    flex: 1,
    backgroundColor: "#F5F5DC", // beige
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#556B2F", // sage green
    textAlign: "center",
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#556B2F",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  text: {
    color: "#444",
    marginVertical: 2,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: "#556B2F",
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#B22222",
    padding: 8,
    borderRadius: 6,
  },
  actionText: {
    color: "#fff",
  },
});
