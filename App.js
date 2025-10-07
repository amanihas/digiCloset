import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ClosetScreen from "./screens/ClosetScreen";

const Stack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);

  const handleLogin = async (token) => {
    await AsyncStorage.setItem("token", token);
    setUserToken(token);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUserToken(null);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {userToken ? (
          <Stack.Screen name="Closet">
            {(props) => <ClosetScreen {...props} token={userToken} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
