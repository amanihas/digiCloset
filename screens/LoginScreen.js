// LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalStyles, colors } from "../styles";
import axios from "axios";

export default function LoginScreen({ navigation, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace this with your computer's local IP if using a physical device
  const API_URL = "http://192.168.1.220:5000/api/auth/login";

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter email and password");
    }

    setLoading(true);
    try {
      const response = await axios.post(API_URL, { email, password });
      const { token } = response.data;

      // Store token locally
      await AsyncStorage.setItem("token", token);
      setToken(token); // Update app state if needed
      Alert.alert("Success", "Logged in successfully!");
    } catch (err) {
      console.log(err.response?.data);
      Alert.alert(
        "Login Failed",
        err.response?.data?.msg || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Welcome Back 👗</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={globalStyles.input}
      />

      <TouchableOpacity
        style={globalStyles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={{ color: colors.textDark, marginTop: 15 }}>
          Don’t have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}


