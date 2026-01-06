import ScenarioContainer from "@/components/ScenarioContainer";
import { useCustomColors } from "@/context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ScenarioScreen() {
  const color = useCustomColors();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={24} color={color.text ?? "#333"} />
        </Pressable>

        <Text style={[styles.headerTitle, {color:color.text}]}>Scenario Change</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.chooseScenario}>
        <ScenarioContainer isSave />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  chooseScenario: { flex: 1, paddingTop: 15, paddingHorizontal: 30 },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
});