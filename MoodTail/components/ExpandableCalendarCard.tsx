import CustomWeekStrip from "@/components/CustomWeekStrip";
import { useDate } from "@/context/DateContext";
import { useCustomColors } from "@/context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import type { MarkedDates } from "react-native-calendars/src/types";
import MonthCalendar from "./MonthCalendar";

type Props = {
  firstDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  onChange?(iso: string): void;
  showExpandIcon?: boolean;
  initialExpanded?: boolean;
  width?: number;
};

export type ExpandableCalHandle = {
  expand(): void;
  collapse(): void;
  toggle(): void;
  isExpanded(): boolean;
  getHeight(): number;
  subscribe(cb: (h: number) => void): () => void;
};

const { width: screenWidth } = Dimensions.get("window");
const todayStr = () => dayjs().format("YYYY-MM-DD");

const defaultWeekH = 110;
const defaultMonthH = 320;

export default forwardRef<ExpandableCalHandle, Props>(function ExpandableCalendarCard(
  { firstDay = 0, onChange, showExpandIcon = true, initialExpanded = false, width = screenWidth - 60 }: Props,
  ref
) {
  const color = useCustomColors();
  const { selectedDate, setSelectedDate } = useDate();
  const [expanded, setExpanded] = useState(initialExpanded);

  // 0 = week, 1 = month
  const anim = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;

  // measured heights
  const [weekH, setWeekH] = useState<number>(92);
  const [calH, setCalH] = useState<number>(defaultMonthH);

  // subs & height cache
  const subs = useRef(new Set<(h: number) => void>());
  const lastH = useRef<number>(initialExpanded ? calH : weekH);
  const notify = (h: number) => {
    if (h === lastH.current) return;
    lastH.current = h;
    subs.current.forEach((cb) => cb(h));
  };

  // marks
  const marked: MarkedDates = useMemo(() => {
    const todayISO = todayStr();
    const m: MarkedDates = { [todayISO]: { marked: true, dotColor: "red", textColor: "red" } };
    m[selectedDate] = {
      ...(m[selectedDate] || {}),
      customStyles: {
        container: { backgroundColor: "#FCD06A", borderRadius: 20 },
        text: { color: "#563E11", fontWeight: "600" as const },
      },
    };
    return m;
  }, [selectedDate]);

  const setDay = (iso: string) => {
    setSelectedDate(iso);
    onChange?.(iso);
  };

  // delta for slide
  const delta = Math.max(0, (calH || defaultMonthH) - (weekH || defaultWeekH));
  const weekTY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, delta] });
  const calTY = anim.interpolate({ inputRange: [0, 1], outputRange: [-delta, 0] });
  const weekOpacity = anim.interpolate({ inputRange: [0, 0.2], outputRange: [1, 0] });
  const calOpacity = anim.interpolate({ inputRange: [0.8, 1], outputRange: [0, 1] });

  const toggle = () => {
    const to = expanded ? 0 : 1;
    const targetH = to === 1 ? (calH || defaultMonthH) : (weekH || defaultWeekH);
    setExpanded(!expanded);
    notify(targetH);
    Animated.timing(anim, {
      toValue: to,
      duration: 300,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useImperativeHandle(
    ref,
    () => ({
      expand: () => !expanded && toggle(),
      collapse: () => expanded && toggle(),
      toggle,
      isExpanded: () => expanded,
      getHeight: () => lastH.current,
      subscribe: (cb: (h: number) => void) => {
        subs.current.add(cb);
        cb(lastH.current);
        return () => subs.current.delete(cb);
      },
    }),
    [expanded, weekH, calH]
  );

  const containerH = expanded ? (calH || defaultMonthH) : (weekH || defaultWeekH);

  return (
    <View style={[styles.card, { width, height: containerH, overflow: "hidden", backgroundColor: color.calendarbg }]}>
      <View style={{ flex: 1 }}>
        {/* Week layer */}
        <Animated.View
          style={[styles.layer, { opacity: weekOpacity, transform: [{ translateY: weekTY }] }]}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            setWeekH(h);
            if (!expanded) notify(h);
          }}
          pointerEvents={expanded ? "none" : "auto"}
        >
          <CustomWeekStrip firstDay={firstDay} height={defaultWeekH} width={width} interactive />
        </Animated.View>

        {/* Month layer */}
        <Animated.View
          style={[styles.layer, { opacity: calOpacity, transform: [{ translateY: calTY }] }]}
          onLayout={(e) => {
            const h = Math.round(e.nativeEvent.layout.height);
            setCalH(h);
            if (expanded) notify(h);
          }}
          pointerEvents={expanded ? "auto" : "none"}
        >
          <MonthCalendar
            firstDay={firstDay}
            current={selectedDate}
            maxDate={todayStr()}
            disableAllTouchEventsForDisabledDays
            onDayPress={(d) => {
              if (dayjs(d.dateString).isAfter(todayStr(), "day")) return;
              setDay(d.dateString);
            }}
            markingType="custom"
            markedDates={marked}
            style={{ width, alignSelf: "center", marginBottom: 30 }}
          />
        </Animated.View>
      </View>
      {showExpandIcon && (
        <Pressable onPress={toggle} hitSlop={12} style={[styles.fab]}>
          <FontAwesome5
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#7A5A22"
          />
        </Pressable>
      )}
      {/* <View style={[styles.topLine, {backgroundColor: color.background1}]} /> */}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F2D489",
    alignSelf: "center",
    position: "relative",
  },
  topLine: { height: 2, width: "100%" },
  layer: { position: "absolute", left: 0, right: 0, top: 0, marginBottom: 30, paddingBottom: 10 },
  fab: {
    position: "relative",
    alignSelf: "center",
  },
});
