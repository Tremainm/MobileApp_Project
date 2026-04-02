import {
  addMonths,
  buildCalendarDays,
  formatMonthLabel,
  startOfMonth,
} from "../utils/date";
import { useCallback, useMemo, useState } from "react";

export default function useCalendarScreen() {
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(today));
  const [selectedDate, setSelectedDate] = useState(today);

  const days = useMemo(
    () => buildCalendarDays(visibleMonth, today),
    [visibleMonth, today],
  );

  const monthLabel = useMemo(
    () => formatMonthLabel(visibleMonth, "en-IE"),
    [visibleMonth],
  );

  const onPrevMonth = useCallback(() => {
    setVisibleMonth(
      (prevMonth) =>
        new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1),
    );
  }, []);

  const onNextMonth = useCallback(() => {
    setVisibleMonth((prevMonth) => addMonths(prevMonth, 1));
  }, []);

  const onSelectDate = useCallback((date, inMonth) => {
    setSelectedDate(date);

    if (!inMonth) {
      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  }, []);
  return {
    selectedDate,
    monthLabel,
    days,
    onPrevMonth,
    onNextMonth,
    onSelectDate,
  };
}
