export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function formatMonthLabel(date, locale = "en-IE") {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

export function formatLongDate(date, locale = "en-IE") {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function buildCalendarDays(monthDate, today) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days = [];

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i;
    const date = new Date(year, month - 1, day);
    days.push({
      date,
      day,
      inMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({
      date,
      day,
      inMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  let nextMonthDay = 1;
  while (days.length % 7 !== 0) {
    const date = new Date(year, month + 1, nextMonthDay);
    days.push({
      date,
      day: nextMonthDay,
      inMonth: false,
      isToday: isSameDay(date, today),
    });
    nextMonthDay += 1;
  }

  return days;
}