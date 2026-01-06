
import { useCustomColors } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  words: string[];
  loading?: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  canSave?: boolean; 
  onSave?: () => void;
};

export default function KeywordsBar({ words, loading, onRefresh, onEdit, canSave, onSave }: Props) {
  const color = useCustomColors();
  return (
    <View style={[styles.header, { }]}>
      <View style={styles.kws}>
        {words.map((w) => (
          <View key={w} style={[styles.kw,{borderColor:color.btnborder1,borderWidth:0.6}]}>
            <Text style={[styles.kwText,{color:color.text1}]}>{w}</Text>
          </View>
        ))}
        <Pressable onPress={onEdit} style={styles.kwIcon}>
          <Ionicons name="pencil" size={18} color={color.text} />
        </Pressable>
        {/* <Pressable
          onPress={onRefresh}
          disabled={loading}
          style={[styles.kwIcon, loading && { opacity: 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator color="#000" size={16} />
          ) : (
            <Ionicons name="refresh" size={18} color="#000" />
          )}
        </Pressable> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  kws: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  kw: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.35)' },
  kwText: { fontWeight: '600', fontSize: 16, },
  kwIcon: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});