import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { SQLiteProvider } from "expo-sqlite";

import { initDatabase } from "./database/database";
import { PantryProvider } from "./context/PantryContext";
import { BasketProvider } from "./context/BasketContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import HomeScreen from "./screens/HomeScreen";
import ShopScreen from "./screens/ShopScreen";
import PantryScreen from "./screens/PantryScreen";
import AddScreen from "./screens/AddScreen";
import CalendarScreen from "./screens/CalendarScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

import { Colors } from "./constants/colors";

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

// Shown when the user is not authenticated
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Shown when the user is authenticated
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Pantry") iconName = focused ? "fast-food" : "fast-food-outline";
          else if (route.name === "Add") iconName = focused ? "add-circle" : "add-circle-outline";
          else if (route.name === "Shop") iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "Calendar") iconName = focused ? "calendar" : "calendar-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.green,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Pantry" component={PantryScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}

// Root decides which navigator to show based on auth state
function RootNavigator() {
  const { token, loading } = useAuth();
  const navigationRef = useRef(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      navigationRef.current?.navigate("Shop");
    });
    return () => subscription.remove();
  }, []);

  // While SecureStore is being read on first mount, show a neutral splash
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0eb28f" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SQLiteProvider databaseName="pantry.db" onInit={initDatabase}>
        <PantryProvider>
          <BasketProvider>
            <RootNavigator />
          </BasketProvider>
        </PantryProvider>
      </SQLiteProvider>
    </AuthProvider>
  );
}