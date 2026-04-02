import { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { isSameDay } from "../../utils/date";
import { Colors } from "../../constants/colors";
export default function DaysCell({
  item,
  selectedDate,
  onPress,
  deliveryDates,
}) {
  const isSelected = useMemo(
    () => isSameDay(item.date, selectedDate),
    [item.date, selectedDate],
  );

  const dateKey = useMemo(() => {
    return item.date.toISOString().split("T")[0];
  }, [item.date]);

  const hasDelivery = item.inMonth && deliveryDates?.has(dateKey);

  return (
    <View style={styles.cell}>
      <Pressable
        onPress={() => onPress(item.date, item.inMonth)}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.circle,
              item.isToday && styles.todayCircle,
              isSelected && styles.selectedCircle,
            ]}
          >
            <Text
              style={[
                styles.dayText,
                !item.inMonth && styles.mutedText,
                item.isToday && styles.todayText,
                isSelected && styles.selectedText,
              ]}
            >
              {item.day}
            </Text>
          </View>
          {hasDelivery && <View style={styles.deliveryDot} />}
        </View>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  cell: {
    width: "14.285%", // 100 / 7
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  pressable: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  mutedText: {
    color: "#9CA3AF",
    fontWeight: "500",
  },

  todayCircle: {
    borderWidth: 1,
    borderColor: Colors.mutedGreen,
    backgroundColor: Colors.mutedGreen,
  },
  todayText: {
    color: "#111827",
  },

  selectedCircle: {
    borderWidth: 1,
    borderColor: Colors.green,
    backgroundColor: Colors.green,
  },
  selectedText: {
    color: "white",
  },
  deliveryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dpdRed,
  },
});
