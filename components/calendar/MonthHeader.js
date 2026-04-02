import { Text, StyleSheet, View } from "react-native";
import MonthNav from "./MonthNav";

export default function MonthHeader({ monthLabel, onPrev, onNext }) {
  return (
    <View style={styles.monthRow}>
      <MonthNav name="chevron-back-outline" onPress={onPrev} />
      <Text style={styles.monthText}>{monthLabel}</Text>
      <MonthNav name="chevron-forward-outline" onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  monthRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
});
