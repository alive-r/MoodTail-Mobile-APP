import CustomWeekStrip from "@/components/CustomWeekStrip";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

type Props = {
  firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  height?: number;
  interactive?: boolean;
};

const { width: screenWidth } = Dimensions.get("window");
const todayStr = () => dayjs().format("YYYY-MM-DD");

function startOfWeek(iso: string, firstDay: Props["firstDay"]) {
  const d = dayjs(iso);
  const off = (d.day() - (firstDay ?? 0) + 7) % 7;
  return d.subtract(off, "day").format("YYYY-MM-DD");
}

export default function WeekCalendar({ firstDay = 0, height = 92, interactive = false }: Props) {
  const today = todayStr();
  const providerDate = useMemo(() => startOfWeek(today, firstDay), [today, firstDay]);
  const width = screenWidth - 60;

  return (
    <View
      pointerEvents={interactive ? "auto" : "none"}
      style={[styles.box, { height }]}
    >
      <CustomWeekStrip
        firstDay={firstDay}
        height={height}
        width={width}
        interactive={interactive}
        showWeekHeaders
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F2D489",
    backgroundColor: "#fff",
    alignSelf: "center",
  },
});
