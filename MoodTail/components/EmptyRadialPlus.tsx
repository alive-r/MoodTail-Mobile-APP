import { useCustomColors } from "@/context/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

type Props = {
  height?: number;
  onPress?: () => void;
};

export default function EmptyRadialPlus({ height = 120, onPress}: Props) {
  const color = useCustomColors();
  return (
    <Pressable onPress={onPress} style={[styles.wrap, { height }]}>
      <Svg style={StyleSheet.absoluteFillObject} preserveAspectRatio="none">
        <Defs>
          <RadialGradient id="goldGlow" cx="50%" cy="50%" r="35%">
            <Stop offset="0%" stopColor={color.background1} stopOpacity={1} />
            <Stop offset="69%" stopColor={color.background1} stopOpacity={0.31} />
            <Stop offset="100%" stopColor={color.background1} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Ellipse
          cx="50%"
          cy="50%"
          rx="70%" 
          ry="60%"
          fill="url(#goldGlow)"
        />
      </Svg>

      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.center]}>
        {/* <Ionicons name="add" size={32} color="#7A5A22" /> */}
        <FontAwesome5 name="plus" size={28} color={color.enableAddScenario}/>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 10,
    width: "100%",
    backgroundColor: "transparent",
    // borderRadius: 0,
    // overflow: "visible",
    // borderWidth: 0,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
});
