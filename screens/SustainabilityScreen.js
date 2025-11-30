import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { globalStyles, colors } from "../styles";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function SustainabilityScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { totalImpact = 0 } = route.params || {};
  const [ecoTips, setEcoTips] = useState([]);

  const screenWidth = Dimensions.get("window").width;

  // Generate a personalized sustainability message
  const getImpactMessage = (score) => {
    if (score <= 10) return "You’re just getting started — let’s add some sustainable pieces!";
    if (score <= 25) return "Nice work! You’re becoming more mindful about your wardrobe choices.";
    if (score <= 50) return "Impressive! Your closet reflects a conscious lifestyle.";
    return "Amazing 🌿 You’re a sustainability champion — inspire others to follow your lead!";
  };

  // Example eco-tips to motivate sustainable behavior
  useEffect(() => {
    const tips = [
      "Choose organic cotton or recycled fabrics when possible.",
      "Donate or upcycle clothes instead of throwing them away.",
      "Wash in cold water to reduce energy use.",
      "Buy from ethical brands that pay fair wages.",
      "Use apps to swap or resell your clothes locally.",
      "Mend torn clothes to extend their lifespan.",
    ];
    // Show 3 random tips
    setEcoTips(tips.sort(() => 0.5 - Math.random()).slice(0, 3));
  }, []);

  // Simple chart showing sustainable vs non-sustainable balance
  const data = [
    {
      name: "Sustainable Choices",
      impact: totalImpact,
      color: "#4CAF50",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Potential Impact Left",
      impact: 100 - totalImpact,
      color: "#E0E0E0",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <ScrollView style={[globalStyles.container, { padding: 20 }]}>
      <Text style={globalStyles.title}>Your Sustainability Impact 🌎</Text>

      <PieChart
        data={data}
        width={screenWidth - 40}
        height={220}
        accessor="impact"
        backgroundColor="transparent"
        paddingLeft="15"
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: () => colors.primary,
          labelColor: () => "#333",
        }}
        hasLegend={true}
      />

      <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>
        Overall Impact Score: <Text style={{ color: colors.primary }}>{totalImpact}</Text>
      </Text>

      <Text style={{ fontSize: 16, color: "#555", marginVertical: 10 }}>
        {getImpactMessage(totalImpact)}
      </Text>

      <Text style={[globalStyles.subtitle, { marginTop: 20 }]}>🌱 Eco Tips for You:</Text>
      {ecoTips.map((tip, i) => (
        <Text key={i} style={{ marginBottom: 8, color: "#444" }}>
          • {tip}
        </Text>
      ))}

      <TouchableOpacity
        style={[globalStyles.button, { marginTop: 25, backgroundColor: colors.accent }]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={globalStyles.buttonText}>Back to Closet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
