// RegisterScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { register } from "../api";
import { globalStyles, colors } from "../styles";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await register({ username, email, password }); // include username
      Alert.alert("Success", "Account created! You can now log in.");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.msg || "Registration failed");
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Create Your Closet 👚</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={globalStyles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={globalStyles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={globalStyles.input}
      />

      <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
        <Text style={globalStyles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={{ color: colors.textDark, marginTop: 15 }}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
