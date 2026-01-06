import HomeTopSection from "@/components/HomeTopSection";
import ScenarioContainer from "@/components/ScenarioContainer";
import SearchBar from "@/components/SearchBar";
import { useCustomColors } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const color = useCustomColors();

  return (
    <View style={[styles.container, { backgroundColor: color.background }]}>
      <SearchBar />
      <View style={styles.main}>
        <View style={styles.topsect}>
          <HomeTopSection />
        </View>

        <View style={[styles.divider, { backgroundColor: color.background1 }]} />

        <View style={styles.chooseScenario}>
          <ScenarioContainer />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 30 },
  main: { width: "100%", marginTop: 10, flex: 1 },
  topsect: { alignItems: "center", marginBottom: 0 },
  divider: { height: 2, width: "100%", marginVertical: 10 },
  chooseScenario: { flex: 1 },
});
