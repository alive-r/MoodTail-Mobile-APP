import { useDate } from "@/context/DateContext";
import { useCustomColors } from "@/context/ThemeContext";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import React, { useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  height?: number;
  width?: number;
  interactive?: boolean;
  showWeekHeaders?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");
const WEEKS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function startOfWeek(iso: string, firstDay?: Props["firstDay"]) {
  const d = dayjs(iso);
  const off = (d.day() - (firstDay ?? 0) + 7) % 7;
  return d.subtract(off, "day");
}

dayjs.extend(isBetween);

export default function CustomWeekStrip({
  firstDay = 0,
  height = 60,
  width = screenWidth - 60,
  interactive = false,
  showWeekHeaders = true,
}: Props) {
  const color = useCustomColors();
  const { today, selectedDate, setSelectedDate } = useDate();
  const effective = selectedDate || today;

  const days = useMemo(() => {
    const start = startOfWeek(effective, firstDay);
    return Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
  }, [effective, firstDay]);

  const monthStr = useMemo(() => {
    const start = startOfWeek(effective, firstDay);
    return start.format("MMMM YYYY");
  }, [effective, firstDay]);

  const weekHasToday = useMemo(() => {
    const start = startOfWeek(effective, firstDay);
    const end = start.add(6, "day");
    return dayjs(today).isBetween(start, end, "day", "[]");
  }, [today, effective, firstDay]);

  const cellW = Math.floor(width / 7);

  return (
    <View style={[styles.box, { height, width, backgroundColor:color.calendarbg }]}>
      <View style={styles.monthWrap}>
        <Text style={styles.monthText}>{monthStr}</Text>

        {!weekHasToday && (
          <Pressable style={styles.todayBtn} onPress={() => setSelectedDate(today)} hitSlop={10}>
            <Text style={styles.monthTodayLink}>Today</Text>
          </Pressable>
        )}
      </View>
      
      {showWeekHeaders && (
        <View style={styles.headerRow}>
          {WEEKS.map((w, i) => (
            <View key={i} style={{ width: cellW, alignItems: "center" }}>
              <Text style={styles.weekday}>{w}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.dateRow}>
      {days.map((d) => {
        const iso = d.format("YYYY-MM-DD");
        const isToday = iso === today;
        const isSelected = iso === (selectedDate || today);
        const isFuture = d.isAfter(dayjs(), "day");

        const Wrapper = interactive ? Pressable : View;
        const onPress = interactive && !isFuture ? () => setSelectedDate(iso) : undefined;

        return (
          <View key={iso} style={{ width: cellW, alignItems: "center", opacity: isFuture ? 0.4 : 1 }}>
            <Wrapper
              {...(interactive ? { onPress, hitSlop: 8, disabled: !!isFuture } : {})}
              style={[
                styles.circle,
                isSelected && !isFuture && styles.circleSelected,
              ]}
              pointerEvents={isFuture ? "none" : "auto"}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && !isFuture && styles.dayTextSelected,
                  isFuture && styles.dayTextDisabled,
                  isToday && !isSelected && styles.todayTextStyle,
                ]}
              >
                {d.date()}
              </Text>
            </Wrapper>
            {isToday && <View style={styles.dot} />}
          </View>
        );
      })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthWrap: {
    width: "100%",
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 4,
  },
  
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6E562A",
    textAlign: "center",
    position: "absolute",
    left: 0,
    right: 0,
  },
  
  todayBtn: {
    position: "absolute",
    right: 10,
    top: 0,
    paddingHorizontal: 4,
  },
  
  monthTodayLink: {
    fontSize: 14,
    color: "#6E562A",
    textDecorationLine: "underline",
  },
  
  
  weekday: { color: "#927643", fontWeight: "400", textAlign: "center" },
  dayTextDisabled: { color: "gray" },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  todayTextStyle: {
    color:"red",
  },
  circle: {
    width: 35, height: 35, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
  },
  circleSelected: { backgroundColor: "#FCD06A" },
  dayText: { color: "#6E562A", fontSize: 16, fontWeight: "300" },
  dayTextSelected: { color: "#563E11", fontWeight:"600" },
  dot: { marginTop: -6, width: 4, height: 4, borderRadius: 3, backgroundColor: "red" },
});
