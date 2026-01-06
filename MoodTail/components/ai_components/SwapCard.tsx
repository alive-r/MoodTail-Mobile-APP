import { useCustomColors } from '@/context/ThemeContext';
import { useAIRecommender } from '@/hooks/useAIRecommendations';
import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CustomText } from '../CustomText';

export type SwapOverlayHandle = {
  open: (base?: string, ingredients?: string[]) => void;
  close: () => void;
};

type Props = {
  baseName?: string;
  titlePrefix?: string;
  ingredients?: string[];
};

const SwapSimplifyButton = forwardRef<SwapOverlayHandle, Props>(
  ({ baseName, titlePrefix = 'Ingredient swaps for', ingredients }, ref) => {
    const color = useCustomColors();
    const { getSwapSimplify, swaps, coaching } = useAIRecommender();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentBase, setCurrentBase] = useState<string | undefined>(baseName);
    const [currentIngredients, setCurrentIngredients] = useState<string[] | undefined>(ingredients);

    const loadingRef = useRef(false);

    const fetchNow = useCallback(
      async (name: string, ings?: string[]) => {
        const safeIngs = (ings ?? currentIngredients ?? []).map(s => (s || '').trim()).filter(Boolean);
        if (!name || safeIngs.length === 0 || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        try {
          await getSwapSimplify(name, safeIngs);
        } finally {
          setLoading(false);
          loadingRef.current = false;
        }
      },
      [getSwapSimplify, currentIngredients]
    );

    useImperativeHandle(
      ref,
      () => ({
        open: (b?: string, ings?: string[]) => {
          const name = (b ?? baseName ?? currentBase)?.trim();
          const nextIngs = (ings ?? ingredients ?? currentIngredients) ?? [];
          if (!name || nextIngs.length === 0) {
            return;
          }
          setCurrentBase(name);
          setCurrentIngredients(nextIngs);
          setVisible(true);
          void fetchNow(name, nextIngs);
        },
        close: () => setVisible(false),
      }),
      [baseName, currentBase, ingredients, currentIngredients, fetchNow]
    );

    const onRefresh = () => {
      const name = (currentBase ?? baseName)?.trim();
      void fetchNow(name || '', currentIngredients);
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={[styles.sheet, {backgroundColor: color.background4}]} onPress={() => {}}>
            <CustomText variant='title' style={styles.title}>
              {titlePrefix} {currentBase}
            </CustomText>

            {loading && (
              <View style={styles.center}>
                <ActivityIndicator />
              </View>
            )}

            {!loading && (!swaps || swaps.length === 0) && (
              <CustomText variant='body' style={styles.empty}>No ingredient swaps yet. Try Refresh.</CustomText>
            )}

            {!loading && swaps?.length > 0 && (
              <View style={styles.list}>
                {swaps.map((s, i) => (
                  <CustomText variant='title' key={i} style={styles.item}>
                    • Missing <Text style={styles.bold}>{s.have}</Text>? Use{' '}
                    <Text style={styles.bold}>{s.use}</Text>
                    {s.note ? ` — ${s.note}` : ''}
                  </CustomText>
                ))}
              </View>
            )}

            {!!coaching && <CustomText variant='body' style={[styles.tip]}>Tip: {coaching}</CustomText>}

            <View style={styles.actions}>
              <Pressable style={[styles.btn, styles.btnGhost, {backgroundColor:color.newScenariodialogcancelbg, borderColor:color.btnborder1,borderWidth:0.6}]} onPress={() => setVisible(false)}>
                <Text style={styles.btnGhostText}>Close</Text>
              </Pressable>
              <Pressable style={[styles.btn,{backgroundColor:color.newScenariodialogokbg,borderColor:color.btnborder1,borderWidth:0.6}]} onPress={onRefresh} disabled={loading}>
                <Text style={[styles.btnText, { color: "#2b2b2b" }]}>{loading ? 'Loading…' : 'Refresh'}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }
);
SwapSimplifyButton.displayName = 'SwapSimplifyButton';

export default SwapSimplifyButton;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 14,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  empty: { marginVertical: 6 },
  list: { gap: 6, marginTop: 6 },
  item: { fontSize: 15, lineHeight: 20 },
  bold: { fontWeight: '600' },
  tip: { marginTop: 10, fontStyle: 'italic'},
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: "transparent",
  },
  btnText: { fontWeight: '600' },
  btnGhost: {
    borderWidth: 1,
  },
  btnGhostText: { fontWeight: '600' },
});