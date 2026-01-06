import { useCustomColors } from "@/context/ThemeContext";
import { IconKey, ICONS } from "@/types/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RadialGradientCircle from "./RadialGradientCircle";

type Props = {
  name: string;
  iconKey?: IconKey;
  faIconName?: React.ComponentProps<typeof FontAwesome5>["name"];
  size?: number;
  selected?: boolean;
  onPress?: () => void;
  enableLongPressDelete?: boolean;
  onDelete?: () => void;
  disabledSelect?: boolean;
  onDisabledPress?: () => void;
};

export default function ScenarioCard({
  name,
  iconKey,
  faIconName,
  size = 96,
  selected = false,
  onPress,
  enableLongPressDelete,
  onDelete,
  disabledSelect = false,
  onDisabledPress,
}: Props) {
  const color = useCustomColors();
  const src = iconKey ? ICONS[iconKey] : undefined;
  const rot = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rot, {
      toValue: selected ? 180 : 0,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const rotateFront = rot.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const rotateBack = rot.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]).start();
  };

  const shakeStyle = {
    transform: [
      {
        translateX: shakeAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: [-6, 6],
        }),
      },
    ],
  };

  const radius = useMemo(() => size / 2, [size]);

  const Inner = src ? (
    <Image source={src} style={styles.img} />
  ) : faIconName ? (
    <FontAwesome5
      name={faIconName}
      size={Math.round(size * 0.52)}
      color="#5A3E15"
    />
  ) : (
    <FontAwesome5
      name="wine-glass"
      size={Math.round(size * 0.52)}
      color="#5A3E15"
    />
  );

  const [showTrash, setShowTrash] = useState(false);

  const handleLongPress = () => {
    if (!enableLongPressDelete) return;
    setShowTrash(true);
  };

  const handlePress = () => {
    if (disabledSelect) {
      triggerShake();
      onDisabledPress?.();
      return;
    }
    if (showTrash) {
      setShowTrash(false);
      return;
    }
    onPress?.();
  };

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} hitSlop={6}>
      <View style={styles.wrapper}>
        <Animated.View style={shakeStyle}>
          <View style={{ width: size, height: size }}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.side,
                {
                  transform: [{ perspective: 1000 }, { rotateY: rotateFront }],
                  borderRadius: radius,
                },
              ]}
            >
              <RadialGradientCircle
                size={size}
                startColor={color.gradientStart1}
                endColor={color.gradientEnd1}
              >
                {Inner}
              </RadialGradientCircle>
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.side,
                {
                  transform: [{ perspective: 1000 }, { rotateY: rotateBack }],
                  borderRadius: radius,
                },
              ]}
            >
              <RadialGradientCircle
                size={size}
                startColor={color.gradientStart2}
                endColor={color.gradientEnd2}
              >
                {Inner}
              </RadialGradientCircle>
            </Animated.View>
            {enableLongPressDelete && showTrash && (
              <Pressable
                onPress={() => {
                  setShowTrash(false);
                  onDelete?.();
                }}
                style={styles.trashButton}
                hitSlop={8}
              >
                <View style={styles.trashInner}>
                  <FontAwesome5 name="trash" size={14} color="#fff" />
                </View>
              </Pressable>
            )}
          </View>
        </Animated.View>
  
        <Text style={[styles.label, { color: color.text1 }]} numberOfLines={1}>
          {name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  side: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",

    shadowColor: "#0F1B30",
    shadowOpacity: 0.50,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 2 },

    elevation: 6,
  },

  img: {
    width: "66%",
    height: "66%",
    resizeMode: "contain",
  },
  label: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  trashWrap: {
    position: "absolute",
    top: 6,
    right: 6,
  },

  trashButton: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  
  trashInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  
});
