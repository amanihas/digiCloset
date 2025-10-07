import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

const API_URL = "http://192.168.1.220:5000/api/login";

export default function LoginScreen({ navigation, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(API_URL, { username, password });
      onLogin(res.data.token);
    } catch (err) {
      Alert.alert("Error", "Invalid credentials or server issue");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>👕 digiCloset Login</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#F5F5DC" },
  header: { fontSize: 26, fontWeight: "bold", color: "#556B2F", textAlign: "center", marginBottom: 30 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: "#556B2F", padding: 10, borderRadius: 8 },
  buttonText: { color: "#fff", textAlign: "center" },
  link: { color: "#556B2F", textAlign: "center", marginTop: 15 },
});
