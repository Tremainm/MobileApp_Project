import { View, Text, StyleSheet } from "react-native";
import MonthHeader from "./MonthHeader";
import WeekdayRow from "./WeekdayRow";


export default function CalendarCard({
  monthLabel,
  onPrevMonth,
  onNextMonth,
}) {
  return (
    <View style={styles.calendarCard}>
      <Text style={styles.sectionTitle}>Delivery Schedule</Text>
      <MonthHeader
        monthLabel={monthLabel}
        onPrev={onPrevMonth}
        onNext={onNextMonth} 
      />
      <WeekdayRow />
    </View>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EFEFF3",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
});
