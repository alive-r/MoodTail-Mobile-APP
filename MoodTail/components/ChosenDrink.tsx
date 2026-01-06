import { CocktailTiles } from "@/components/CocktailList";
import EmptyRadialPlus from "@/components/EmptyRadialPlus";
import { useSelectedDrink } from "@/context/SelectedDrinkContext";
import { useCustomColors } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ChosenDrink() {
  const router = useRouter();
  const { drinks, reloadDrinks } = useSelectedDrink();
  const color = useCustomColors();
  
  useFocusEffect(
    useCallback(() => {
      reloadDrinks();
    }, [reloadDrinks])
  );

  const empty = !drinks || drinks.length === 0;

  const goSearchForDate = () => {
    router.push({ pathname: "/shared/search", params: { pickForDate: "1" } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { textShadowColor:color.text1, color: color.text1 }]}>Cocktail of the Date</Text>
        <Pressable onPress={goSearchForDate} hitSlop={10} style={styles.editBtn}>
          <Ionicons name="create-outline" size={18} color="#7A5A22" />
        </Pressable>
      </View>

      {empty ? (
        <EmptyRadialPlus onPress={goSearchForDate} />
      ) : (
        // <CocktailList data={drinks} />
        <CocktailTiles data={drinks} bailout={true}/>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 14,
    // backgroundColor: "rgba(255, 253, 247, 0)",
    borderWidth: 1,
    borderColor: "rgba(242, 212, 137, 0)",
    // marginTop: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
