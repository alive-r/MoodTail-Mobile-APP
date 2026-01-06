import CocktailCard from '@/components/CocktailCard';
import { useAIRecommender } from '@/hooks/useAIRecommendations';
import type { Drink } from '@/types/types';
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { default as React, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import KeywordsBar from '@/components/ai_components/KeywordsBar';
import ScenarioForm from '@/components/ai_components/ScenarioForm';
import { useScenarios } from '@/context/SelectedScenarioContext';
import { useCustomColors } from '@/context/ThemeContext';
import { CustomText } from '../CustomText';

export default function AIRecommendation() {
  const router = useRouter();
  const color = useCustomColors();

  const { intro, loading, error, whyMap, recommendByWords } = useAIRecommender();

  const { scenarios } = useScenarios();

  const [input, setInput] = useState('');
  const [words, setWords] = useState<string[]>([]);

  const [mode, setMode] = useState<'intro' | 'results'>('intro');

  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [settledWords, setSettledWords] = useState<string[]>([]);
  const [emptyReason, setEmptyReason] = useState<string | null>(null);

  const didAutoRefresh = useRef(false);

  const scenarioWordsFromSelection = useMemo(() => {
  return scenarios
    .map(s => s.name.toLowerCase())
    .slice(0, 3);
}, [scenarios]);

  const currentWords = useMemo(() => {
    if (settledWords.length > 0) return settledWords;
    if (words.length > 0) return words;
    if (scenarioWordsFromSelection.length > 0) return scenarioWordsFromSelection;
    return [];
  }, [settledWords, words, scenarioWordsFromSelection]);

  useEffect(() => {
    const hasAnyWords =
      settledWords.length > 0 ||
      words.length > 0 ||
      scenarioWordsFromSelection.length > 0;

    setMode(hasAnyWords ? 'results' : 'intro');
  }, [settledWords, words, scenarioWordsFromSelection]);

  const onGo = useCallback(
    async (wsIn?: string[]) => {
      const ws = (wsIn && wsIn.length)
        ? wsIn.slice(0, 3)
        : input
            .split(/[,\s]+/)
            .map(s => s.trim())
            .filter(Boolean)
            .slice(0, 3);
  
      if (!ws.length) return;
  
      setEmptyReason(null);
  
      const { drinks: ds, settledWords: sw } = await recommendByWords(ws);
  
      if (!ds || ds.length === 0) {
        setDrinks([]);
        const finalWords = sw && sw.length ? sw : ws;
        setSettledWords(finalWords);
        setWords(finalWords);
        setMode('results');
  
        setEmptyReason(
          'Our AI bartender is receiving too many requests right now. Please try again in a moment.'
        );
        return;
      }
  
      setDrinks(ds);
      const finalWords = sw && sw.length ? sw : ws;
      setSettledWords(finalWords);
      setWords(finalWords);
      setMode('results');
    },
    [input, recommendByWords]
  );
  

  const onRefresh = useCallback(() => {
    if (currentWords.length > 0) {
      void onGo(currentWords);
    }
  }, [currentWords, onGo]);

  useEffect(() => {
    if (mode === 'results' && !didAutoRefresh.current) {
      didAutoRefresh.current = true;
      onRefresh();
    }
  }, [mode, onRefresh]);

  // only show drinks that have an explanation in whyMap
  const filteredDrinks = useMemo(() => {
    return drinks.filter((item) => {
      console.log(drinks)
      const key = item.id ?? item.name.toLowerCase();
      const reason = whyMap[key] ?? whyMap[item.name.toLowerCase()] ?? '';
      return !!reason;
    });
  }, [drinks, whyMap]);

  const onEdit = useCallback(() => {
    setMode('intro');
    setInput(currentWords.join(', '));
  }, [currentWords]);

  const renderItem = useCallback(
    ({ item }: { item: Drink }) => {
      const key = item.id ?? item.name.toLowerCase();
      const reason = whyMap[key] ?? whyMap[item.name.toLowerCase()] ?? '';

      return (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <CocktailCard item={item} />
          {!!reason && (
            <CustomText variant='body' style={{ marginTop: 0, marginBottom: 14, marginLeft: 5 }}>
              {item.name}: {reason}
            </CustomText>
          )}
        </View>
      );
    },
    [whyMap, color]
  );

  return (
    <View style={[styles.bg, { backgroundColor:color.background, flex: 1 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="x" size={24} color={color.text} />
        </Pressable>

        <Text style={[styles.headerTitle, {color:color.text}]}>AI Recommendation</Text>
        {/* spacer to balance the close icon width */}
        <View style={{ width: 24 }} />
      </View>
      {mode === 'intro' ? (
        <View style={styles.bg}>
          <ScenarioForm
            value={input}
            onChange={setInput}
            onSubmit={() => onGo()}
            loading={loading}
            error={error}
          />
        </View>
      ) : (
        <KeywordsBar
          words={currentWords}
          loading={loading}
          onRefresh={onRefresh}
          onEdit={onEdit}
          canSave={false}
          onSave={() => {}}
        />
      )}
      {mode === 'results' && !!intro ? (
        <View
          style={[styles.bg,{
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 0,
            padding: 8,
            // backgroundColor: '#f4f4f4',
            borderRadius: 10,
          }]}
        >
          <Text style={{ color: color.text1, fontSize:16, marginBottom: 12, lineHeight: 20, textAlign: 'justify' }}>
            {intro}
          </Text>
        </View>
      ) : null}

      {loading && drinks.length === 0 && (
        <View style={[styles.bg,{ flex: 1, justifyContent: 'center', alignItems: 'center' }]}>          
          <CustomText variant="title" style={{ textAlign: 'center' }}>
            Recommendations are being generated...
          </CustomText>
          <ActivityIndicator style={{ marginTop: 16 }} />
        </View>
      )}

      {mode === 'results' && !loading && filteredDrinks.length === 0 && (
        <View style={{ paddingVertical: 24, paddingHorizontal: 24 }}>
          <CustomText
            variant="body"
            style={{ textAlign: 'center', color: color.text1 }}
          >
            {emptyReason ??
              'Our AI bartender could not find any recommendations. Please try again in a moment.'}
          </CustomText>
        </View>
      )}
      
      <FlatList
        data={filteredDrinks}
        keyExtractor={(item) => item.id ?? `${item.name}-${item.thumb ?? ''}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bg:{
    // backgroundColor: '#f5f2ea',
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
})