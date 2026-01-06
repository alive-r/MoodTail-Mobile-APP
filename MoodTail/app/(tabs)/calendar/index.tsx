import ChosenDrink from "@/components/ChosenDrink";
import ChosenPhoto from "@/components/ChosenPhoto";
import ChosenScenarioBar from "@/components/ChosenScenarioBar";
import ExpandableCalendarCard, { type ExpandableCalHandle } from "@/components/ExpandableCalendarCard";
import SearchBar from "@/components/SearchBar";
import React, { useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function CalendarScreen() {
  const calRef = useRef<ExpandableCalHandle>(null);

  return (
    <View style={styles.container}>
      <SearchBar />
      <View style={styles.body}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ExpandableCalendarCard
            ref={calRef}
            firstDay={0}
            showExpandIcon
            onChange={(d) => console.log("selected:", d)}
          />

          <View style={styles.section}>
            <ChosenScenarioBar />
          </View>
          <View style={styles.section}>
            <ChosenDrink />
          </View>
          <View style={styles.section}>
            <ChosenPhoto />
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", alignItems:'center' },
  body: { paddingHorizontal:30, paddingTop: 16,alignContent:"center",paddingBottom:130 },
  section: { marginTop: 8 },
});
