import React from 'react';
import { View, StyleSheet } from 'react-native';

import HomeSectionHeader from './HomeSectionHeader';
import QuickActionButton from './QuickActionButton';

export default function QuickActionsSection({ onAddPress, onViewPantryPress }) {
  return (
    <View>
      <HomeSectionHeader title="Quick Actions" />

      <View style={styles.row}>
        <QuickActionButton
          label="Add Item"
          backgroundColor="#10bf86"
          onPress={onAddPress}
        />
        <QuickActionButton
          label="View Pantry"
          backgroundColor="#377ced"
          onPress={onViewPantryPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    columnGap: 16,
  },
});