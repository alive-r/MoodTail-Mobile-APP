import { useCustomColors } from "@/context/ThemeContext";
import React, { memo } from "react";
import { Calendar, type CalendarProps } from "react-native-calendars";

export default memo(function MonthCalendar(props: CalendarProps) {
  const color = useCustomColors();

  const calendarKey = color.calendarbg ?? JSON.stringify(color);

  return (
    <Calendar
      key={calendarKey}
      theme={{
        backgroundColor: color.calendarbg,
        calendarBackground: color.calendarbg,
        arrowColor: color.calendarArrowColor,
        monthTextColor: color.calendarMonthTextColor,
        textMonthFontWeight: "600",
        textSectionTitleColor: color.calendarTextSectionTitleColor,
        dayTextColor: color.calendarDayTextColor,
        todayTextColor: color.calendarTodayTextColor,
        textDisabledColor: color.calendarTextDisabledColor,
        selectedDayBackgroundColor: color.calendarSelectedDayBackgroundColor,
        selectedDayTextColor: color.calendarSelectedDayTextColor,
      }}
      {...props}
    />
  );
});
