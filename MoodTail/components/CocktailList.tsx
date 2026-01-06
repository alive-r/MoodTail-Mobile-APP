import type { Drink } from '@/types/types';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, View } from 'react-native';
import CocktailCard from './CocktailCard';

export default function CocktailList({ data, navi }: { data: Drink[], navi?:boolean }) {
  return (
    <FlatList
      data={data}
      keyExtractor={(d) => d.id}
      renderItem={({ item }) => <CocktailCard item={item} disableNavigation = {navi} />}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

export function CocktailTiles({ data, navi, bailout=false }: { data: Drink[], navi?:boolean, bailout?:boolean }) {
  const [items, setItems] = useState(data);

  useEffect(() => {
    setItems(data);
  }, [data]);

  const animRefs = useRef(new Map<string, Animated.Value>()).current;

  const getAnim = (id: string) => {
    if (!animRefs.has(id)) {
      animRefs.set(id, new Animated.Value(1));
    }
    return animRefs.get(id)!;
  };

  const handleRemove = (id: string) => {
    if(bailout){
      const anim = getAnim(id);
  
      return new Promise<void>((resolve) => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          resolve();
        });
      });
    }
  };

  return (
    <View style={styles.listContent}>
      {items.map((item) => {
        const anim = getAnim(item.id);
        return (
          <Animated.View
            key={item.id}
            style={{ opacity: anim, transform: [{ scale: anim }] }}
          >
            <CocktailCard item={item} disableNavigation = {navi} onDeleteAnim={() => handleRemove(item.id)} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 5,
  },
});