import EmptyRadialPlus from "@/components/EmptyRadialPlus";
import ScenarioCard from "@/components/ScenarioCard";
import { useScenarios } from "@/context/SelectedScenarioContext";
import { useCustomColors } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ChosenScenarioBar() {
  const router = useRouter();
  const { scenarios } = useScenarios();
  const color = useCustomColors();
  const goEdit = () => router.push("/shared/scenarioModal");
  const empty = !scenarios || scenarios.length === 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { textShadowColor:color.text1, color: color.text1 }]}>Scenario of the Date</Text>
        <Pressable onPress={goEdit} hitSlop={10} style={styles.editBtn}>
          <Ionicons name="create-outline" size={18} color="#7A5A22" />
        </Pressable>
      </View>

      {empty ? (
        <EmptyRadialPlus onPress={goEdit} />
      ) : (
        <Pressable onPress={goEdit} style={{ flexGrow: 1 }}>
          <View style={styles.cardsRow}>
            {scenarios.map((s) => (
              <View key={s.id} style={styles.cardWrap}>
                <ScenarioCard
                  name={s.name}
                  iconKey={s.iconKey}
                  size={70}
                  selected={true}
                  onPress={() => { }}
                  enableLongPressDelete={false}
                />
              </View>
            ))}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    backgroundColor: "rgba(255, 253, 247, 0)",
    borderWidth: 1,
    borderColor: "rgba(242, 212, 137, 0)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    marginTop: 18,
  },
  header: { flexDirection: "row", alignItems: "center" },
  title: {
    fontSize: 16, fontWeight: "600",
    textShadowOffset: { width: -5, height: 10 },
    textShadowRadius: 15,
  },
  editBtn: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: "#F2D489",
    backgroundColor: "#FFF4CF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  // New layout for cards
  cardsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 6,
  },
  
  cardWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
});
