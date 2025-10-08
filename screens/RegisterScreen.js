import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { globalStyles, colors } from "../styles";
import { API_BASE } from "../api";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = `${API_BASE}/auth/register`;

  const handleRegister = async () => {
    if (!username || !email || !password) return Alert.alert("Error", "Fill all fields");
    try {
      const res = await axios.post(API_URL, { username, email, password });
      // API returns token + user; store token directly to keep logged in if desired
      if (res.data.token) {
        Alert.alert("Registered", "Account created and logged in.");
        // optionally store token and navigate to closet automatically
      } else {
        Alert.alert("Registered", "Account created! You can now log in.");
      }
      navigation.navigate("Login");
    } catch (err) {
      console.log("Register error:", err.response?.data || err.message);
      Alert.alert("Register failed", err.response?.data?.msg || "Try again");
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Create Your Closet 👚</Text>

      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={globalStyles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={globalStyles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={globalStyles.input} />

      <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
        <Text style={globalStyles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={{ color: colors.textDark, marginTop: 15 }}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
