import { useFavorites } from '@/context/FavoriteContext';
import { useSelectedDrink } from '@/context/SelectedDrinkContext';
import { useCustomColors } from '@/context/ThemeContext';
import type { Drink } from '@/types/types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SwapSimplifyOverlay, { SwapOverlayHandle } from './ai_components/SwapCard';

export default function CocktailCard({
  item,
  disableNavigation,
  onDeleteAnim,
}: {
  item: Drink;
  disableNavigation?: boolean;
  onDeleteAnim?: () => void;
}) {
  const { isSelected, addDrinkItem, deleteDrinkItem } = useSelectedDrink();
  const { isFaved, addFavoriteItem, deleteFavoriteItem } = useFavorites();
  const selected = isSelected(item.id);
  const favored = isFaved(item.id);
  const color = useCustomColors();
  const router = useRouter();

  const ingredients =
    item.ingredients?.map((ing) => ing.name?.trim()).filter(Boolean) ?? [];

  const scaleAnimSelect = useRef(new Animated.Value(1)).current;
  const scaleAnimFav = useRef(new Animated.Value(1)).current;

  const bounce = (anim: Animated.Value) => {
    anim.setValue(1);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1.12,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onToggleSelect = async () => {
    bounce(scaleAnimSelect);
    try {
      if (selected) {
        if (onDeleteAnim) {
          await onDeleteAnim();
        }
        await deleteDrinkItem(item.id);
      } else {
        await addDrinkItem(item);
      }
    } catch (e) {
      console.warn('Toggle select failed', e);
    }
  };

  const onToggleFav = async () => {
    bounce(scaleAnimFav);
    try {
      if (favored) await deleteFavoriteItem(item.id);
      else await addFavoriteItem(item);
    } catch (e) {
      console.warn('Toggle favorite failed', e);
    }
  };

  const handleCardPress = () => {
    if (disableNavigation) return;
    router.push({
      pathname: '/shared/cocktailDetailModal',
      params: { id: item.id },
    });
  };
  const swapRef = useRef<SwapOverlayHandle>(null);
  const handleLongPress = () => {
    swapRef.current?.open(item.name, ingredients);
  };

  const SelectIcon = useMemo(
    () =>
      selected ? (
        <Feather name="minus-circle" size={22} color="#a9a9a9" />
      ) : (
        <Feather name="plus-circle" size={22} color={color.icon1} />
      ),
    [selected]
  );

  const HeartIcon = useMemo(
    () =>
      favored ? (
        <MaterialCommunityIcons name="heart" size={22} color="#ff001e" />
      ) : (
        <MaterialCommunityIcons
          name="heart-outline"
          size={22}
          color="#ff001e"
        />
      ),
    [favored]
  );

  return (
    <>
      <Pressable
        onPress={handleCardPress}
        onLongPress={handleLongPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: color.background2,
              borderColor: color.btnborder1,
            },
          ]}
        >
          <View style={styles.imageColumn}>
            <Image
              source={{ uri: item.thumb ?? undefined }}
              style={styles.thumb}
              resizeMode="cover"
            />
            {item.alcoholicTag === 'Non alcoholic' && (
              <View style={styles.nonAlcoholBadge}>
                <Text style={[styles.nonAlcoholBadgeText, { color: color.text1 }]}>
                  0% ALC.
                </Text>
              </View>
            )}
          </View>
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <Text style={[styles.cardTitle, { color: color.text1 }]}>
                {item.name}
              </Text>
            </View>
            <Text
              style={[styles.cardIng, { color: color.text3 }]}
              numberOfLines={2}
            >
              {ingredients.length ? ingredients.join(' · ') : ''}
            </Text>
          </View>
          <View style={styles.actions}>
            <Pressable
              onPress={onToggleSelect}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.iconPressed,
              ]}
            >
              <Animated.View
                style={{ transform: [{ scale: scaleAnimSelect }] }}
              >
                <View
                  style={[
                    styles.iconWrap,
                    selected ? styles.iconSelected : null,
                  ]}
                >
                  {SelectIcon}
                </View>
              </Animated.View>
            </Pressable>
            <Pressable
              onPress={onToggleFav}
              hitSlop={8}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && styles.iconPressed,
              ]}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnimFav }] }}>
                <View
                  style={[
                    styles.iconWrap,
                    favored ? styles.iconFav : null,
                  ]}
                >
                  {HeartIcon}
                </View>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </Pressable>
      <SwapSimplifyOverlay
        ref={swapRef}
        baseName={item.name}
        ingredients={ingredients}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 0.5,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 5 },
  },

  imageColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 6,
  },

  thumb: { width: 55, height: 55, borderRadius: 8, backgroundColor: '#FFFDF7' },

  cardBody: { flex: 1, justifyContent: 'center' },

  cardTitle: { fontSize: 19, fontWeight: '600', marginBottom: 4 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  nonAlcoholBadge: {
    marginTop: 5,
    alignSelf: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ffffff40',
  },

  nonAlcoholBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  cardIng: { fontSize: 15 },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  iconBtn: {
    alignItems: 'center',
  },

  iconPressed: {
    opacity: 0.65,
  },

  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconSelected: {},

  iconFav: {},

  iconText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});
