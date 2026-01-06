import { CocktailTiles } from '@/components/CocktailList';
import SearchBar from '@/components/SearchBar';
import { useCustomColors } from '@/context/ThemeContext';
import { useDrinkSearch } from '@/hooks/useDrinkSearch';
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SearchModal() {
  const router = useRouter();
  const color = useCustomColors();
  const {
    query, setQuery,
    filter, setFilter,
    drinks,
    loading,
    error,
  } = useDrinkSearch('');

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: color.background}]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
       <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={24} color={color.text} />
        </Pressable>

        <Text style={[styles.headerTitle, {color:color.text}]}>Search</Text>
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.subheader}>
        <View style={styles.searchBar}>
          <SearchBar
            mode="input"
            placeholder="Search cocktail ..."
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmit={(text) => setQuery(text)}
          />
        </View>
        <View style={styles.filterRow}>
          <Segment
            label="All"
            active={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <Segment
            label="Cocktails"
            active={filter === 'cocktail'}
            onPress={() => setFilter('cocktail')}
          />
          <Segment
            label="Ingredients"
            active={filter === 'ingredient'}
            onPress={() => setFilter('ingredient')}
          />
        </View>

        {loading ? (
          <ActivityIndicator  size="small" color="#666" />
        ) : null}
        {error ? <Text style={[styles.meta, { color: '#c00' }]}>{error}</Text> : null}
        {!loading && !error && !query.trim().length ? (
          <Text style={styles.meta}>Type to search by cocktail or ingredient.</Text>
        ) : null}
        {!loading && !error && !!query.trim().length && drinks.length === 0 ? (
          <Text style={styles.meta}>
            No cocktails found. Please try a different keyword.
          </Text>
        ) : null}
      </View>
      <ScrollView 
        bounces
        showsVerticalScrollIndicator={false}
        style={{marginHorizontal: 14}} 
      >
        <CocktailTiles data={drinks} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const color = useCustomColors();
  return (
    <Pressable onPress={onPress} style={[styles.segment, {backgroundColor:color.btnbg2, borderColor: color.btnborder1}, active && {backgroundColor:color.btnbg1}]}>
      <Text style={[styles.segmentText, {color:color.text3}, active && [styles.segmentTextActive, {color:color.text1}]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subheader: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', gap: 8, alignItems: 'center',  justifyContent: 'center', marginLeft:20},
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segmentActive: {  },
  segmentText: { fontSize: 14},
  segmentTextActive: { fontWeight: '600' },
  meta: { fontSize: 12, color: '#666',  textAlign:'center'},
});