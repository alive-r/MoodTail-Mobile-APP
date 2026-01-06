import { useDate } from "@/context/DateContext";
import { useCustomColors } from "@/context/ThemeContext";
import dayjs from "dayjs";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
export default function HomeTopSection() {
  const color = useCustomColors();
  const { selectedDate, setSelectedDate } = useDate();

  const d = dayjs(selectedDate); 
  const weekday = d.format("dddd"); 
  const displayDate = d.format("MMM D, YYYY");

  const todayISO = dayjs().format("YYYY-MM-DD");
  const isToday = selectedDate === todayISO;

  const backToToday = () => {
    setSelectedDate(todayISO);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={[styles.date, {color: color.text1}]}>{displayDate}</Text>
        <Text style={styles.week}>{weekday}</Text>
      </View>

      {!isToday && (
        <Pressable style={styles.btn} onPress={backToToday} hitSlop={10}>
          <Text style={styles.btnText}>Back to today</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  left: {
    flexDirection: "column",
  },
  date: {
    fontSize: 20,
    fontWeight: "700",
  },
  week: {
    marginTop: 2,
    fontSize: 14,
    color: "#8F7A50",
  },
  btn: {
    backgroundColor: "#FFE8B2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F2D489",
  },
  btnText: {
    color: "#6E562A",
    fontSize: 14,
    fontWeight: "600",
  },
});
