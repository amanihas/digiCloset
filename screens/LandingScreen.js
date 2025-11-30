// screens/LandingScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { globalStyles, colors } from "../styles";

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DigiCloset</Text>
      <Text style={styles.subtitle}>
        Digitize your wardrobe and make smarter, more sustainable outfit choices.
      </Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <View style={styles.features}>
        {["Snap items", "Track impact", "Plan outfits", "Declutter"].map((text) => (
          <View key={text} style={styles.featureTag}>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textDark,
    marginBottom: 40,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.sage,
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  featureTag: {
    backgroundColor: "#eae8e4",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    margin: 5,
  },
  featureText: {
    color: colors.textDark,
    fontWeight: "500",
  },
});
