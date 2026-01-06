import { getIngredientDetail, searchCocktailsByIngredient } from "@/api/cocktailApi";
import { CocktailTiles } from "@/components/CocktailList";
import { CustomText } from "@/components/CustomText";
import { useCustomColors } from "@/context/ThemeContext";
import type { Drink, Ingredient } from "@/types/types";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function IngredientScreen() {
  const color = useCustomColors();
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();

  const [loading, setLoading] = useState(true);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!name) return;

      try {
        setLoading(true);
        const [ingRaw, dsRaw] = await Promise.all([
          getIngredientDetail(String(name)),
          searchCocktailsByIngredient(String(name)),
        ]);
        if (!mounted) return;

        const ing: Ingredient | null = ingRaw
          ? {
  
              id: ingRaw.idIngredient,
              name: ingRaw.strIngredient,
              description: ingRaw.strDescription ?? null,
              type: ingRaw.strType ?? null,
              abv: ingRaw.strABV ?? null,
            }
          : null;
        const dsArray: any[] = Array.isArray(dsRaw)
          ? dsRaw
          : Array.isArray((dsRaw as any)?.drinks)
          ? (dsRaw as any).drinks
          : [];
        const normalized: Drink[] = dsArray
          .map((d: any) => (d && typeof d === "object" ? d : null))
          .filter((d: any): d is any => !!d)
          .map((d: any) => ({
            id: String(d.idDrink), 
            name: d.strDrink,
            thumb: d.strDrinkThumb ?? null,
            completeness: "partial" as const,
          }));
        const deduped = Array.from(new Map(normalized.map((d) => [d.id, d])).values());

        setIngredient(ing ?? { id: "unknown", name: String(name) });
        setDrinks(deduped);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [name]);

  const headerTitle = useMemo(() => ingredient?.name ?? String(name), [ingredient, name]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: color.background}]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={24} color={color.text} />
        </Pressable>

        <Text style={[styles.headerTitle, {color:color.text}]}>{headerTitle}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView>
      {!!ingredient?.description && (
        <View style={styles.descCard}>
          <CustomText variant="title" style={[styles.descText]} numberOfLines={expanded ? undefined : 3}>
            {String(ingredient.description)}
          </CustomText>

          <Pressable
            onPress={() => setExpanded((v) => !v)}
            hitSlop={8}
            style={({ pressed }) => [styles.expandRow, pressed && { opacity: 0.7 }]}
          >
            <CustomText variant="body" style={styles.expandText}>{expanded ? "Close" : "Expand"}</CustomText>
            <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={color.text3} />
          </Pressable>
        </View>
      )}
      <View style={{ paddingHorizontal: 12, paddingBottom: 40 }}>
        {drinks.length === 0 ? (
          <CustomText variant="body" style={styles.emptyText}>
            No cocktails found for this ingredient.
          </CustomText>
        ) : (
          <CocktailTiles data={drinks} navi />
        )}
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  descCard: {
    width: "92%",
    alignSelf: "center",
    backgroundColor: "#a8a8a886",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  descText: { fontSize: 14, lineHeight: 20 },
  expandRow: {
    marginTop: 6,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  expandText: { fontSize: 12, marginRight: 2 },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 24,
  },
});
