import { useMemo } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { isSameDay } from "../../utils/date";
import { Colors } from "../../constants/colors";

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DaysCell({
  item,
  selectedDate,
  onPress,
  expiryCountsByDateKey,
}) {
  const isSelected = useMemo(
    () => isSameDay(item.date, selectedDate),
    [item.date, selectedDate],
  );

  const markerCount = useMemo(() => {
    if (!item.inMonth) return 0;
    const dateKey = toDateKey(item.date);
    return Math.min(expiryCountsByDateKey?.get(dateKey) || 0, 3);
  }, [item.date, item.inMonth, expiryCountsByDateKey]);

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
          {markerCount > 0 && (
            <View style={styles.dotRow}>
              {Array.from({ length: markerCount }).map((_, index) => (
                <View key={index} style={styles.deliveryDot} />
              ))}
            </View>
          )}
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
    position: "relative",
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
  dotRow: {
    position: "absolute",
    bottom: -6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  deliveryDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.dpdRed,
  },
});
