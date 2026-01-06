import { getCocktailsByID } from '@/api/cocktailApi';
import SwapSimplifyOverlay, { SwapOverlayHandle } from '@/components/ai_components/SwapCard';
import { CustomText } from '@/components/CustomText';
import { useEntity } from '@/context/EntityContext';
import { useFavorites } from '@/context/FavoriteContext';
import { useCustomColors } from '@/context/ThemeContext';
import { mapApiDrinkToFull } from '@/mappers/cocktailMappers';
import type { Drink } from '@/types/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';


export default function CocktailDetailModal() {
  const color = useCustomColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { state, dispatch } = useEntity();
  const idStr = String(id ?? '');

  const { isFaved, addFavoriteItem, deleteFavoriteItem } = useFavorites();

  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);

  const favored = useMemo(() => (drink ? isFaved(drink.id) : false), [drink, isFaved]);
  const swapRef = useRef<SwapOverlayHandle>(null);
  const ingredients =
    drink?.ingredients?.map((ing) => ing.name?.trim()).filter(Boolean) ?? [];
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (!idStr) {
          if (mounted) {
            setDrink(null);
            setLoading(false);
          }
          return;
        }

        setLoading(true);

        const fromCtx = state.drinksById[idStr];
        if (fromCtx && fromCtx.completeness === 'full') {
          if (mounted) {
            setDrink(fromCtx);
            setLoading(false);
          }
          return;
        }
        const arr = await getCocktailsByID(idStr);
        const d = arr?.[0] ? mapApiDrinkToFull(arr[0]) : null;

        if (!mounted) return;

        if (d) {
          dispatch({ type: 'UPSERT_DRINKS', drinks: [d] });
        }
        setDrink(d);
      } catch (e) {
        console.warn('fetch drink by id failed:', e);
        if (mounted) setDrink(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [idStr, state.drinksById, dispatch]);

  const onToggleFavorite = async () => {
    if (!drink) return;
    try {
      if (favored) {
        await deleteFavoriteItem(drink.id);
      } else {
        await addFavoriteItem(drink);
      }
    } catch (e) {
      console.warn('toggle favorite failed:', e);
    }
  };

  const onToggleSwap = async () => {
    if (!drink) return;
    swapRef.current?.open(drink.name, ingredients);
  };

  const onPressIngredient = (name: string) => {
    router.push({
      pathname: '/shared/ingredientModal',
      params: { name },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Loading…' }} />
        <ActivityIndicator />
      </View>
    );
  }

  if (!drink) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text>Sorry, this cocktail cannot be loaded.</Text>
      </View>
    );
  }

  return (
    <>
    <View style={[styles.container, {backgroundColor: color.background}]}>
    <View style={styles.header}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
      >
        <Feather name="x" size={24} color={color.text} />
      </Pressable>

      <Text style={[styles.headerTitle, {color:color.text}]}>{drink.name}</Text>
      <View style={{ width: 24 }} />
    </View>


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces
        showsVerticalScrollIndicator={false}
      >
        {drink.thumb ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: drink.thumb }} style={[styles.image, {borderColor: color.btnborder1}]} resizeMode="cover" />
          </View>
        ) : null}
        <CustomText variant="title" style={[styles.sectionTitle]}>Ingredients</CustomText>
        <View style={styles.ingList}>
          {drink.ingredients?.length ? (
            drink.ingredients.map((ing, idx) => (
              <Pressable
                key={`${ing.name}-${idx}`}
                onPress={() => onPressIngredient(ing.name)}
                style={({ pressed }) => [styles.ingItem, pressed && styles.ingItemPressed]}
              >
                <CustomText variant="body" style={[styles.ingText]}>
                  {ing.measure ? `${ing.measure} ` : ''}
                  <Text style={styles.ingName}>{ing.name}</Text>
                </CustomText>
              </Pressable>
            ))
          ) : (
            <Text style={[styles.emptyText, {color: color.text3}]}>No ingredients info</Text>
          )}
        </View>
        <CustomText variant='title' style={[styles.sectionTitle, { marginTop: 16 }]}>Instructions</CustomText>
        <CustomText variant='body' style={[styles.instructions]}>
          {drink.instructions ?? 'No instructions provided.'}
        </CustomText>
        <Pressable onPress={onToggleFavorite} style={({ pressed }) => [styles.favBtn, pressed && { opacity: 0.85 }, {backgroundColor: color.btnbg1}]}>
          <MaterialCommunityIcons name={favored ? 'heart' : 'heart-outline'} size={18} color="#ff001e" />
          <Text style={[styles.favBtnText, {color:color.btntext1}]}>
            {favored ? 'Remove from favorites' : 'Add to favorites'}
          </Text>
        </Pressable>

        <Pressable onPress={onToggleSwap} style={({ pressed }) => [styles.swapBtn, pressed && { opacity: 0.85}]}>
          <Text style={[styles.favBtnText, {color:color.text3}]}>
            Ingredient Swap Suggestions
          </Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
    <SwapSimplifyOverlay
      ref={swapRef}
      baseName={drink.name}
      ingredients={ingredients}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  imageWrap: {
    marginTop: 30,
    marginBottom: 30,
    width: 220,
    height: 220,
    borderRadius: 8,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth:2,
  },
  glow: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: -20,
    bottom: -20,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 215, 0, 0.18)',
    zIndex: -1,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },

  ingList: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
    maxWidth: '100%',
  },
  ingItemPressed: {
    opacity: 0.7,
  },
  ingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  ingName: {
    textDecorationLine: 'underline',
  },
  emptyText: {
    color: '#777',
    fontSize: 14,
  },

  instructions: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 6,
    marginBottom: 18,
  },

  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop:15
  },

  favBtnText: {
    fontSize: 15,
    marginLeft: 8,
    fontWeight: '600',
  },
});
