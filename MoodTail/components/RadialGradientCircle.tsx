import React from "react";
import { View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

type Props = {
  size: number;
  startColor: string;
  endColor: string;
  children?: React.ReactNode;
};

export default function RadialGradientCircle({
  size,
  startColor,
  endColor,
  children,
}: Props) {
  const radius = size / 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="40%" r="75%">
            <Stop offset="0%" stopColor={startColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={endColor} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
      </Svg>

      {children}
    </View>
  );
}
