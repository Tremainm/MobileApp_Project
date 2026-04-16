import { View, StyleSheet } from "react-native";
import MonthHeader from "./MonthHeader";
import WeekdayRow from "./WeekdayRow";
import DaysGrid from "./DaysGrid";

export default function CalendarCard({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  days,
  selectedDate,
  onSelectDate,
  expiryCountsByDateKey,
}) {
  return (
    <View style={styles.calendarCard}>
      <MonthHeader
        monthLabel={monthLabel}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
      />
      <WeekdayRow />
      <DaysGrid
        days={days}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        expiryCountsByDateKey={expiryCountsByDateKey}
      />
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
});
