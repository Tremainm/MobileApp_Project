import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../constants/colors";

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function WeekdayRow() {
  return (
    <View style={styles.weekRow}>
      {DAYS_OF_WEEK.map((day) => (
        <Text key={day} style={styles.weekdayText}>
          {day}
        </Text>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    color: Colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
});
