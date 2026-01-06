import { useCustomColors } from "@/context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { ComponentProps, useEffect, useReducer, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
const R = 30;
const CIRCLE_DIAM = R * 2;
const FLOAT_MAX = 15;

export default function MyTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  type RouteType = (typeof state.routes)[number];
  
  const color = useCustomColors();
  const centersRef = useRef<Record<string, number>>({}).current;
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  const lift0 = useSharedValue(0);
  const lift1 = useSharedValue(0);
  const lift2 = useSharedValue(0);

  useEffect(() => {
    const idx = state.index;
    lift0.value = withSpring(idx === 0 ? 1 : 0, { damping: 16, stiffness: 180 });
    lift1.value = withSpring(idx === 1 ? 1 : 0, { damping: 16, stiffness: 180 });
    lift2.value = withSpring(idx === 2 ? 1 : 0, { damping: 16, stiffness: 180 });
  }, [state.index]);

  const circleStyle0 = useAnimatedStyle(() => ({ bottom: lift0.value * FLOAT_MAX }));
  const circleStyle1 = useAnimatedStyle(() => ({ bottom: lift1.value * FLOAT_MAX }));
  const circleStyle2 = useAnimatedStyle(() => ({ bottom: lift2.value * FLOAT_MAX }));
  const circleStyles = [circleStyle0, circleStyle1, circleStyle2] as const;

  const handlePress =
    (routeKey: string, routeName: string, isFocused: boolean) =>
    () => {
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey as never,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName as never);
      }
    };

  const renderPill = (route: RouteType, index: number) => {
    const isFocused = state.index === index;
    const label = route.name;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityLabel={label}
        android_ripple={{ color: "transparent", borderless: false }}
        onPress={handlePress(route.key, route.name, isFocused)}
        onLongPress={() =>
          navigation.emit({ type: "tabLongPress", target: route.key })
        }
        onLayout={(e) => {
          const { x, width } = e.nativeEvent.layout;
          centersRef[route.key] = x + width / 2;
          forceUpdate();
        }}
        style={{
          height: "100%",
          flex: 1,
          marginHorizontal: 6,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        }}
      />
    );
  };

  const renderBubbles = () =>
    state.routes.map((route: RouteType, index: number) => {
      const animBottomStyle = circleStyles[index];
      const isSelected = state.index === index;
      const left = (centersRef[route.key] ?? 0) - R;

      const icon = getIconName(route.name);
      const iconColor = isSelected ? color.tabIconSelected : color.tabIconDefault;
      const shadow = isSelected ? color.tabIconSelected : "transparent";

      return (
        <Animated.View
          key={`bubble-${route.key}`}
          style={[
            animBottomStyle,
            {
              position: "absolute",
              left,
              alignSelf: "flex-start",
              height: CIRCLE_DIAM,
              width: CIRCLE_DIAM,
              borderRadius: R,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 999,
              pointerEvents: "box-none",
            },
          ]}
        >
          <Pressable
            onPress={handlePress(route.key, route.name, isSelected)}
            style={{
              height: 50,
              width: 50,
              borderRadius: 30,
              backgroundColor: color.tabMain,
              borderWidth: 1,
              borderColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: shadow,
              shadowOpacity: 0.28,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: -5 },
            }}
          >
            <FontAwesome5 name={icon} size={23} color={iconColor} solid />
          </Pressable>
        </Animated.View>
      );
    });

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 15,
        marginHorizontal: 30,
        height: 56,
        borderRadius: 60,
        backgroundColor: "transparent",
        borderTopWidth: 0,
        overflow: "visible",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 22,
        alignItems: "stretch",
        justifyContent: "center",
        pointerEvents: "box-none",
      }}
    >
      <View
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 60,
          overflow: "hidden",
          pointerEvents: "none",
          backgroundColor: color.tabMain,
        }}
      >
    <View pointerEvents="none" style={[styles.stroke, {borderColor:color.tabMain}]} />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          height: "100%",
          paddingHorizontal: 10,
          overflow: "visible",
          pointerEvents: "box-none",
        }}
      >
        {state.routes.map((route: RouteType, index: number) => renderPill(route, index))}
      </View>

      {renderBubbles()}
    </View>
  );
}
function getIconName(routeName: string): ComponentProps<typeof FontAwesome5>["name"] {
  const lower = routeName.toLowerCase();
  if (lower.includes("calendar")) return "calendar-alt";
  if (lower.includes("favorite")) return "heart";
  if (lower.includes("home")) return "wine-glass-alt";
  return "dot-circle";
}

const styles = StyleSheet.create({
  stroke: {
    position: "absolute",
    inset: 0,
    borderRadius: 60,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
