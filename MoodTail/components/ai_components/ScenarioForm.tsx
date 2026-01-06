import { useCustomColors } from '@/context/ThemeContext';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomText } from '../CustomText';

type IntroFormProps = {
  value: string;
  onChange: (s: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
};

export default function ScenarioForm({ value, onChange, onSubmit, loading, error }: IntroFormProps) {
  const color = useCustomColors();
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <CustomText variant='title' style={{ fontSize: 18, fontWeight: '600' }}>
        Give me 2-3 words for tonight's vibe.
      </CustomText>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="e.g., cozy, rain, book"
        style={{ backgroundColor:color.newScenariodialoginputbg, borderColor:color.newScenariodialoginputborder, color:color.newScenariodialoginputtext, borderWidth: 1, borderRadius: 12, padding: 12 }}
      />
      <Pressable
        onPress={onSubmit}
        style={{ marginHorizontal: "auto", width: '55%', backgroundColor: color.btnbg1,borderColor:color.btnborder1, borderWidth:0.6, padding: 12, borderRadius: 12, alignItems: 'center' }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ fontWeight:700, color:color.text1, }}>Get AI Recommendation</Text>}
      </Pressable>
      {!!error && <Text style={{ color: 'crimson' }}>{error}</Text>}
      <View style={[styles.divider, { backgroundColor: color.background1 }]} />
      
    </View>
  );
}
const styles = StyleSheet.create({
  divider: { height: 2, width: "100%", marginVertical: 10 },
});