import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import SustainabilityScreen from "./screens/SustainabilityScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} setToken={setToken} setUsername={setUsername} />}
        </Stack.Screen>
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home">
          {(props) => (
            <HomeScreen {...props} setToken={setToken} username={username} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Sustainability">
          {(props) => (
            <SustainabilityScreen {...props} username={username} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
