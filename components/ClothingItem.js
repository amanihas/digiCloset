import React from "react";
import { View, Image, Text } from "react-native";
import { colors } from "../styles";

export default function ClothingItem({ item }) {
  return (
    <View style={{ margin: 10 }}>
      <Image source={{ uri: item.image }} style={{ width: 150, height: 150, borderRadius: 12, backgroundColor: colors.white }} />
      <Text style={{ textAlign: "center", marginTop: 5 }}>{item.name}</Text>
    </View>
  );
}
