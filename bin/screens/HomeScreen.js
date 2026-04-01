// HomeScreen
// - Purpose: Simple welcome screen with navigation to Inventory screen.
// - Props:
//    - navigation: react-navigation prop used to navigate to other screens
// - Output: renders a welcome message and a button to go to Inventory.

import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import useBasket from '../hooks/useBasket';
import useNotifications from '../hooks/useNotifications';

export default function HomeScreen({ navigation }) {
  const { basket, fetchBasketItems } = useBasket();
  useNotifications(); // registers handler, requests permission, and sets up Android channel

  // Load the basket on mount and every time the screen comes back into focus.
  useEffect(() => {
    fetchBasketItems().catch(() => {});
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBasketItems().catch(() => {});
    });
    return unsubscribe;
  }, [navigation]);

  // Remind the user if they have items in the basket.
  useEffect(() => {
    const itemCount = basket?.length ?? 0;
    if (itemCount > 0) {
      console.log("Scheduling basket reminder");
      // Uncomment to prevent duplicate notifications if the user navigates back and forth.
      // Notifications.cancelAllScheduledNotificationsAsync();
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Items in your basket',
          body: `You have ${itemCount} item(s) waiting — don't forget to checkout!`,
          channelId: 'default',
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5 }
      });
    }
  }, [basket]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to ShopDemo</Text>
        <Text style={styles.subtitle}>Your Product Management System</Text>
        <Text style={styles.text}>
          Use the tabs below to browse products, manage your basket, or update your inventory.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    marginBottom: 8,
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
  text: { 
    fontSize: 14, 
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
