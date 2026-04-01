import { StyleSheet, Text, View, ScrollView } from 'react-native'
import useCalendarScreen from '../hooks/useCalendarScreen';
import CalendarCard from '../components/calendar/CalendarCard';


export default function CalendarScreen() {
  const {
    selectedDate,
    monthLabel,
    days,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
  } = useCalendarScreen();

  return (
    <ScrollView>
      <View>
        <CalendarCard
          monthLabel={monthLabel}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          days={days}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      </View>
    </ScrollView>
  )
}
const styles = StyleSheet.create({})