import { useMemo } from "react";
import { Text, View, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import useCalendarScreen from "../hooks/useCalendarScreen";
import CalendarCard from "../components/calendar/CalendarCard";
import PantryItem from "../components/PantryItem";
import { usePantry } from "../context/PantryContext";
import { formatLongDate } from "../utils/date";

const DAY_MS = 1000 * 60 * 60 * 24;

function toDateOnly(dateLike) {
  if (!dateLike) return null;
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function CalendarScreen({ navigation }) {
  const { getItems, deletePantryItem } = usePantry();
  const {
    selectedDate,
    monthLabel,
    days,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
  } = useCalendarScreen();

  const pantryItems = getItems();

  const expiryCountsByDateKey = useMemo(() => {
    const counts = new Map();

    pantryItems.forEach((item) => {
      const expiryDate = toDateOnly(item.expiryDate);
      if (!expiryDate) return;
      const dateKey = toDateKey(expiryDate);
      counts.set(dateKey, (counts.get(dateKey) || 0) + 1);
    });

    return counts;
  }, [pantryItems]);

  const selectedDateItems = useMemo(() => {
    const targetDate = toDateOnly(selectedDate);
    if (!targetDate) return [];

    return pantryItems
      .map((item) => {
        const expiryDate = toDateOnly(item.expiryDate);
        if (!expiryDate) return null;

        const dayDiff = Math.round((expiryDate - targetDate) / DAY_MS);
        if (Math.abs(dayDiff) > 1) return null;

        return { item, dayDiff, expiryDate };
      })
      .filter(Boolean)
      .sort((a, b) => {
        const diffDistance = Math.abs(a.dayDiff) - Math.abs(b.dayDiff);
        if (diffDistance !== 0) return diffDistance;

        const dateDiff = a.expiryDate - b.expiryDate;
        if (dateDiff !== 0) return dateDiff;

        return a.item.name.localeCompare(b.item.name);
      })
      .map((entry) => entry.item);
  }, [pantryItems, selectedDate]);

  function handleEdit(item) {
    navigation.navigate("Add", { item, timestamp: Date.now() });
  }

  function handleDelete(id) {
    deletePantryItem(id);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.header}>Expiry Calendar</Text>

        <View style={styles.calendarWrap}>
          <CalendarCard
            monthLabel={monthLabel}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            days={days}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            expiryCountsByDateKey={expiryCountsByDateKey}
          />

          <Text style={styles.listTitle}>
            Expiring around {formatLongDate(selectedDate)}
          </Text>
          <Text style={styles.listSubtitle}>
            Showing items expiring 1 day before or after selected date.
          </Text>

          {selectedDateItems.length > 0 ? (
            selectedDateItems.map((item) => (
              <PantryItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No nearby expiries</Text>
              <Text style={styles.emptyText}>
                Add expiry dates to pantry items and they will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calendarWrap: {
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 13,
    color: "#777",
    marginBottom: 10,
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 13,
    color: "#888",
  },
});
