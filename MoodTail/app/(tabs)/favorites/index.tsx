import CocktailCard from "@/components/CocktailCard";
import { CustomText } from "@/components/CustomText";
import ScenarioCard from "@/components/ScenarioCard";
import SearchBar from "@/components/SearchBar";
import { useCalendarIndex } from "@/context/CalendarIndexContext";
import { useFavorites } from "@/context/FavoriteContext";
import { useCustomColors } from "@/context/ThemeContext";
import { getDrinks } from "@/storage/drinks";
import { getScenarios } from "@/storage/scenarios";
import { OFFLINE_SCENARIOS, Scenario } from "@/types/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function FavoriteScreen() {
  const { favorites } = useFavorites();
  const { datesWithData } = useCalendarIndex();

  const [sortMode, setSortMode] = useState<"az" | "za" | "recent">("az");
  const [top3DrinksLast30, setTop3DrinksLast30] = useState<any[]>([]);
  const [top3, setTop3] = useState<string[]>([]);
  const [diceSuggestion, setDiceSuggestion] = useState<string | null>(null);

  const [favExpanded, setFavExpanded] = useState(false);
  const [ingredientExpanded, setIngredientExpanded] = useState(false);
  const [alcoholExpanded, setAlcoholExpanded] = useState(false);

  const color = useCustomColors();

  const diceScale = useRef(new Animated.Value(1)).current;

  const animateDice = () => {
    Animated.sequence([
      Animated.timing(diceScale, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(diceScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const compute = async () => {
      const last30Dates = Array.from(datesWithData).slice(-30);

      const counter: Record<string, { count: number; drink: any }> = {};

      for (const d of last30Dates) {
        const drinks = await getDrinks(d);
        drinks.forEach((drink) => {
          if (!counter[drink.id]) {
            counter[drink.id] = { count: 1, drink };
          } else {
            counter[drink.id].count += 1;
          }
        });
      }

      const sorted = Object.values(counter)
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map((x) => ({ ...x.drink, times: x.count }));

      setTop3DrinksLast30(sorted);
    };

    compute();
  }, [datesWithData]);

  const dicePlayer = useAudioPlayer(require("@/assets/sounds/dice.mp3"));

  const playDiceSound = () => {
    try {
      dicePlayer.seekTo(0);
      dicePlayer.play();
    } catch (err) {
      console.log("Dice sound error:", err);
    }
  };

  const id2scenario = useMemo(() => {
    const m = new Map<string, Scenario>();
    OFFLINE_SCENARIOS.forEach((s) => m.set(s.name, s));
    return m;
  }, []);
  useEffect(() => {
    const run = async () => {
      const counter: Record<string, number> = {};
      const last30 = Array.from(datesWithData).slice(-30);
      for (const d of last30) {
        const arr = await getScenarios(d);
        arr.forEach((s) => {
          counter[s.name] = (counter[s.name] ?? 0) + 1;
        });
      }

      const sorted = Object.entries(counter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((x) => x[0]);

      setTop3(sorted);
    };
    run();
  }, [datesWithData]);

  const alcoholicPercent = useMemo(() => {
    if (favorites.length === 0) return 0;
    const alcoholicCount = favorites.filter(c => c.alcoholicTag === "Alcoholic").length;
    return Math.round((alcoholicCount / favorites.length) * 100);
  }, [favorites]);

  const sortedFavorites = useMemo(() => {
    const arr = [...favorites];

    if (sortMode === "az") {
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortMode === "za") {
      return arr.sort((a, b) => b.name.localeCompare(a.name));
    }

    return arr;
  }, [favorites, sortMode]);

  const totalFavorites = favorites.length;

  const ingredientsCount = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((c) =>
      c.ingredients?.forEach((ing) => set.add(ing.name))
    );
    return set.size;
  }, [favorites]);

  const uniqueIngredients = useMemo(() => {
    const set = new Set<string>();
    favorites.forEach((c) =>
      c.ingredients?.forEach((ing) => set.add(ing.name))
    );
    return Array.from(set);
  }, [favorites]);

  
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const weekDay = today.getDay(); // 0-6

  const startOfWeek = new Date(year, month, today.getDate() - weekDay);
  const startOfMonth = new Date(year, month, 1);

  const isSameOrAfter = (date: Date, target: Date) =>
    date.getTime() >= target.getTime();

  const thisWeekCount = Array.from(datesWithData).filter((d) => {
    const dt = new Date(d);
    return isSameOrAfter(dt, startOfWeek);
  }).length;

  const thisMonthCount = Array.from(datesWithData).filter((d) => {
    const dt = new Date(d);
    return isSameOrAfter(dt, startOfMonth);
  }).length;

  
  const pickRandom = () => {
    if (favorites.length === 0) return null;
    const index = Math.floor(Math.random() * favorites.length);
    return favorites[index];
  };

  const datesArray = Array.from(datesWithData).slice(0, 15);

  return (
    <View style={styles.container}> 
      <View style={styles.searchBar}>
        <SearchBar />
      </View>
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={[styles.dashboard]}>
        <CustomText variant="title" style={styles.dashboardTitle}>
          Your Favorites Overview
        </CustomText>
        <View style={styles.row}>
          <Pressable
            style={styles.metricBox}
            onPress={() => {
              if (ingredientExpanded || alcoholExpanded) return;
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setFavExpanded((prev) => !prev);
            }}
            disabled={ingredientExpanded || alcoholExpanded}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CustomText style={styles.metricNumber}>
                  {totalFavorites}
                </CustomText>
                <CustomText
                  style={[
                    styles.arrow,
                    {
                      marginLeft: 4,
                      opacity:
                        ingredientExpanded || alcoholExpanded ? 0.3 : 1,
                    },
                  ]}
                >
                  {favExpanded ? "▲" : "▼"}
                </CustomText>
              </View>
              <CustomText style={styles.metricLabel}>Favorites</CustomText>
            </View>
          </Pressable>

          <Pressable
            style={styles.metricBox}
            onPress={() => {
              if (favExpanded || alcoholExpanded) return;
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setIngredientExpanded((prev) => !prev);
            }}
            disabled={favExpanded || alcoholExpanded}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CustomText style={styles.metricNumber}>
                  {ingredientsCount}
                </CustomText>
                <CustomText
                  style={[
                    styles.arrow,
                    {
                      marginLeft: 4,
                      opacity: favExpanded || alcoholExpanded ? 0.3 : 1,
                    },
                  ]}
                >
                  {ingredientExpanded ? "▲" : "▼"}
                </CustomText>
              </View>
              <CustomText style={styles.metricLabel}>Ingredients</CustomText>
            </View>
          </Pressable>

          <Pressable
            style={styles.metricBox}
            onPress={() => {
              if (favExpanded || ingredientExpanded) return;
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              setAlcoholExpanded((prev) => !prev);
            }}
            disabled={favExpanded || ingredientExpanded}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <CustomText style={styles.metricNumber}>
                  {alcoholicPercent}%
                </CustomText>
                <CustomText
                  style={[
                    styles.arrow,
                    {
                      marginLeft: 4,
                      opacity: favExpanded || ingredientExpanded ? 0.3 : 1,
                    },
                  ]}
                >
                  {alcoholExpanded ? "▲" : "▼"}
                </CustomText>
              </View>
              <CustomText style={styles.metricLabel}>Alcohol</CustomText>
            </View>
          </Pressable>
        </View>

        {favExpanded && (
          <View style={{ marginTop: 10 }}>
            <View>
              {sortedFavorites.map((c, idx) => (
                <CocktailCard key={idx} item={c} />
              ))}
            </View>
          </View>
        )}

        {ingredientExpanded && (
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                maxHeight: 200,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 12,
                padding: 12,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <CustomText
                style={{
                  fontSize: 13,
                  marginBottom: 8,
                  opacity: 0.8,
                }}
              >
                Unique ingredients used across your favorite cocktails.
              </CustomText>
              <ScrollView nestedScrollEnabled>
                {uniqueIngredients.map((ing, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 8,
                      borderBottomWidth:
                        idx === uniqueIngredients.length - 1 ? 0 : 1,
                      borderBottomColor: "rgba(0,0,0,0.08)",
                    }}
                  >
                    <FontAwesome5
                      name="leaf"
                      size={18}
                      color={color.text}
                      style={{ marginRight: 10 }}
                    />
                    <CustomText style={{ fontSize: 14 }}>
                      {ing}
                    </CustomText>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {alcoholExpanded && (
          <View style={{ marginTop: 10 }}>
            <View
              style={{
                maxHeight: 200,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 12,
                padding: 12,
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <CustomText
                style={{
                  fontSize: 13,
                  marginBottom: 8,
                  opacity: 0.8,
                }}
              >
                Breakdown of alcoholic vs non-alcoholic favorites.
              </CustomText>
              <ScrollView nestedScrollEnabled>
                {/* Alcoholic row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                    borderBottomWidth: 1,
                    borderBottomColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <FontAwesome5
                    name="wine-bottle"
                    size={22}
                    color={color.text}
                    style={{ marginRight: 10 }}
                  />
                  <CustomText style={{ fontSize: 14 }}>
                    Alcoholic:{" "}
                    {
                      favorites.filter(
                        (c) => c.alcoholicTag === "Alcoholic"
                      ).length
                    }
                  </CustomText>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                >
                  <FontAwesome5
                    name="glass-whiskey"
                    size={22}
                    color={color.text}
                    style={{ marginRight: 10 }}
                  />
                  <CustomText style={{ fontSize: 14 }}>
                    Non-Alcoholic:{" "}
                    {
                      favorites.filter(
                        (c) => c.alcoholicTag !== "Alcoholic"
                      ).length
                    }
                  </CustomText>
                </View>
              </ScrollView>
            </View>
          </View>
        )}


        <View style={styles.frequencySection}>
          <CustomText variant="title" style={styles.dashboardTitle}>
            Usage Frequency
          </CustomText>

          <View style={styles.freqRow}>
            <View style={styles.metricBoxUsage}>
              <CustomText style={styles.metricNumber}>
                {thisWeekCount}
              </CustomText>
              <CustomText style={styles.metricLabel}>This Week</CustomText>
            </View>

            <View style={styles.metricBoxUsage}>
              <CustomText style={styles.metricNumber}>
                {thisMonthCount}
              </CustomText>
              <CustomText style={styles.metricLabel}>This Month</CustomText>
            </View>
            <View style={styles.metricBoxUsage}>
              <CustomText style={styles.metricNumber}>
                {datesArray.length}
              </CustomText>
              <CustomText style={styles.metricLabel}>
                Total Active Days
              </CustomText>
            </View>
          </View>
        </View>
        <View style={styles.topMoodsSection}>
          <CustomText variant="title" style={styles.dashboardTitle}>Top Scenarios</CustomText>

          <View style={styles.topMoodsRow}>
            {top3.length === 0 && (
              <CustomText style={{opacity: 0.5 }}>
                No scenarios yet
              </CustomText>
            )}

            {top3.map((name, idx) => {
              const scenario = id2scenario.get(name);
              if (!scenario) return null;

              return (
                <View key={idx} style={styles.cardWrap}>
                <ScenarioCard
                  key={idx}
                  name={scenario.name}
                  iconKey={scenario.iconKey}
                  size={76}
                  selected={true}
                  onPress={() => {}}
                />
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <CustomText variant="title" style={styles.dashboardTitle}>
            Top Drinks (Past 30 Days)
          </CustomText>

          {top3DrinksLast30.length === 0 && (
            <CustomText style={{opacity: 0.5 }}>
              No drink data in last 30 days
            </CustomText>
          )}

          <View
            style={{
              flexDirection: "row",
              // gap: 16,
              // flexWrap: "wrap",
              marginTop: 10,
              justifyContent: "space-evenly",
            }}
          >
            {top3DrinksLast30.map((drink, idx) => (
              <View
                key={idx}
                style={{
                  width: 110,
                  alignItems: "center",
                  backgroundColor: color.background2,
                  borderColor:color.btnborder1,
                  borderWidth:0.6,
                  padding: 10,
                  borderRadius: 12,
                }}
              >
                <View
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <Image
                    source={{ uri: drink.thumb }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                <CustomText
                  numberOfLines={2}
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  {drink.name}
                </CustomText>

                <CustomText
                  style={{
                    fontSize: 14,
                    marginTop: 4,
                  }}
                >
                  {drink.times} time{drink.times > 1 ? "s" : ""}
                </CustomText>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={async () => {
            animateDice();
            playDiceSound();

            const c = pickRandom();
            if (c) {
              setDiceSuggestion(`Try this tonight: ${c.name}`);
            } else {
              setDiceSuggestion(
                "No favorites yet — add some to use the dice!"
              );
            }
          }}
        >
          <Animated.View
            style={[styles.actionButton, { backgroundColor: color.background2, transform: [{ scale: diceScale }] }]}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <FontAwesome5
                  name="dice"
                  size={90}
                  color={color.text}
                  style={{ marginRight: 8 }}
                />
                {/* <CustomText style={styles.actionText}>Throw Dice</CustomText> */}
                <View style={{ flexDirection: "column" }}>
                  <CustomText
                    style={{
                      fontSize: 14,
                      opacity: 0.8,
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    Pick a drink from your favorites.
                  </CustomText>
                  {diceSuggestion && (
                    <View style={{ marginTop: 8, alignItems: "center" }}>
                      <CustomText
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          textAlign: "center",
                        }}
                      >
                        {diceSuggestion}
                      </CustomText>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>

        {/* Health Reminder */}
        <View style={{ marginTop: 10, marginBottom: 30, alignItems: "center" }}>
          <CustomText
            style={{
              fontSize: 13,
              fontStyle: "italic",
              textAlign: "center",
            }}
          >
            Please drink responsibly.{"\n"}Avoid excessive alcohol consumption.
          </CustomText>
        </View>
      </View>
    </ScrollView>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", paddingHorizontal: 15 },
  searchBar: { marginBottom: 10, alignItems: "center" },

  dashboard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
  },
  dashboardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metricBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  metricNumber: { fontSize: 20, fontWeight: "bold" },
  metricLabel: { fontSize: 12 },

  heatmapRow: {
    flexDirection: "row",
    marginTop: 6,
    flexWrap: "wrap",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginVertical: 14,
    // backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    alignItems: "center",
  },
  actionText: { fontWeight: "500", fontSize: 18 },

  sortRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  sortButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#FFF4CF",
  },
  sortSelected: {
    backgroundColor: "#fcd06a",
  },

  main: { flex: 1, width: "100%" },

  frequencySection: {
    marginTop: 14,
  },

  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },

  freqRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  listToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  listToggleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  listToggleArrow: {
    fontSize: 16,
  },

  collapsedHint: {
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    paddingVertical: 20,
  },
  topMoodsSection: {
    marginTop: 20,
    paddingTop: 8,
  },

  topMoodsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 6,
    flexWrap: "wrap",
  },
  cardWrap: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 10,
  },
  metricBoxUsage: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "column",
  },
});
