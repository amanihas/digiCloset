import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { globalStyles, colors } from "../styles";
import { API_BASE } from "../api";

export default function LoginScreen({ navigation, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = `${API_BASE}/auth/login`;

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert("Error", "Enter email & password");

    setLoading(true);
    try {
      const res = await axios.post(API_URL, { email, password });
      const { token, user } = res.data;

      // Save both token and username to AsyncStorage
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("username", user.username);

      setToken(token);
      navigation.replace("Home");
    } catch (err) {
      console.log("Login error:", err.response?.data || err.message);
      Alert.alert("Login failed", err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome Back 👗</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={globalStyles.input} autoCapitalize="none" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={globalStyles.input} />

      <TouchableOpacity style={globalStyles.button} onPress={handleLogin} disabled={loading}>
        <Text style={globalStyles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={{ color: colors.textDark, marginTop: 15 }}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}
