// HomeScreen
// - Purpose: Simple welcome screen with navigation to Inventory screen.
// - Props:
//    - navigation: react-navigation prop used to navigate to other screens
// - Output: renders a welcome message and a button to go to Inventory.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';

import ExpiringSoonCard from '../components/home/ExpiringSoonCard';
import HomeHeader from '../components/home/HomeHeader';
import HomeSectionHeader from '../components/home/HomeSectionHeader';
import QuickActionsSection from '../components/home/QuickActionsSection';
import StatCard from '../components/home/StatCard';
import { usePantry } from '../context/PantryContext';
import useBasket from '../hooks/useBasket';
import useNotifications from '../hooks/useNotifications';

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  return Math.round((expiry - today) / (1000 * 60 * 60 * 24));
}

function formatDaysLabel(daysLeft) {
  if (daysLeft === 0) return 'Today';
  return `${daysLeft}d`;
}

function getAlertColor(daysLeft) {
  if (daysLeft <= 1) return '#ff2d20';
  if (daysLeft <= 4) return '#ff5a1f';
  return '#ff6f2c';
}

export default function HomeScreen({ navigation }) {
  const { getItems } = usePantry();
  const { basket, fetchBasketItems } = useBasket();
  useNotifications(); // registers handler, requests permission, and sets up Android channel

  const pantryItems = getItems();
  const expiringItems = pantryItems
    .map(item => ({
      ...item,
      daysLeft: getDaysUntilExpiry(item.expiryDate),
    }))
    .filter(item => item.daysLeft !== null && item.daysLeft >= 0 && item.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const totalItems = pantryItems.length;
  const expiringCount = expiringItems.length;
  const toBuyCount = basket.length;
  const upcomingItems = expiringItems.slice(0, 3);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.heroSection}>
          <HomeHeader />

          <View style={styles.statsRow}>
            <StatCard label="Total" value={totalItems} suffix="Items" />
            <StatCard label="Expiring" value={expiringCount} suffix="Soon" accentColor="#ff5a1f" />
            <StatCard label="To Buy" value={toBuyCount} suffix="Items" accentColor="#2962ff" />
          </View>
        </View>

        <View style={styles.bodySection}>
          <HomeSectionHeader
            title="Expiring Soon"
            actionLabel="View All"
            onPress={() => navigation.navigate('Pantry')}
          />

          {upcomingItems.length > 0 ? (
            upcomingItems.map(item => (
              <ExpiringSoonCard
                key={item.id}
                name={item.name}
                category={item.category}
                daysLabel={formatDaysLabel(item.daysLeft)}
                alertColor={getAlertColor(item.daysLeft)}
              />
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing is expiring soon</Text>
              <Text style={styles.emptyText}>Items with dates in the next 7 days will appear here.</Text>
            </View>
          )}

          <View style={styles.quickActionsSection}>
            <QuickActionsSection
              onAddPress={() => navigation.navigate('Add')}
              onViewPantryPress={() => navigation.navigate('Pantry')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0eb28f',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  contentContainer: {
    paddingBottom: 28,
  },
  heroSection: {
    backgroundColor: '#0eb28f',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 26,
  },
  statsRow: {
    flexDirection: 'row',
    columnGap: 16,
  },
  bodySection: {
    flex: 1,
    backgroundColor: '#f5f6f8',
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#112033',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6d7782',
    lineHeight: 20,
  },
  quickActionsSection: {
    marginTop: 10,
    marginBottom: 8,
  },
});
