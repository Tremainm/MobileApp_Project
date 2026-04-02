import { StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function MonthNav({ onPress, name }) {
  return (
    <Pressable onPress={onPress} style={styles.monthNavButton}>
      <Ionicons name={name} size={20} color="black" />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  monthNavButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
