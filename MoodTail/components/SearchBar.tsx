import { useCustomColors } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import React from 'react';
import type { TextInputProps } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  href?: Href;
  mode?: 'button' | 'input';
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  onSubmit?: (text: string) => void;
  returnKeyType?: TextInputProps['returnKeyType'];
}

export default function SearchBar({
  placeholder = 'Search',
  href = '/shared/search' as Href,
  mode = 'button',
  value,
  onChangeText,
  autoFocus = false,
  onSubmit,
  returnKeyType = 'search',
}: SearchBarProps) {
  const color = useCustomColors();
  const router = useRouter();

  if (mode === 'button') {
    return (
      <Pressable
        onPress={() => router.push(href)}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      >
        <Ionicons name="search" size={18} color="#999999" />
        <Text style={[styles.placeholder, {color: color.text3}]}>{placeholder}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color="#999999" />
      <TextInput
        style={[styles.input, {color: color.text3}]}
        placeholder={placeholder}
        placeholderTextColor={color.text3}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={(e) => onSubmit?.(e.nativeEvent.text)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    borderRadius: 24,
    width: 340,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0, 
  },
  placeholder: {
    fontSize: 17,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});