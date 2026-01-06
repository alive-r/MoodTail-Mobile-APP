import ScenarioCard from "@/components/ScenarioCard";
import { useScenarios } from "@/context/SelectedScenarioContext";
import { useCustomColors } from "@/context/ThemeContext";
import { OFFLINE_SCENARIOS, Scenario } from "@/types/types";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AddScenarioDialog from "./AddMoodDialog";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type ScenarioContainerProps = {
  isSave?: boolean;
};

export default function ScenarioContainer({ isSave = false }: ScenarioContainerProps) {
  const color = useCustomColors();
  const pool = useMemo<Scenario[]>(() => OFFLINE_SCENARIOS, []);
  const id2item = useMemo(() => {
    const m = new Map<string, Scenario>();
    pool.forEach((s) => m.set(s.id, s));
    return m;
  }, [pool]);

  const { scenarios, addScenarioItem, deleteScenarioItem, isSelected } =
    useScenarios();
  const selectedSet = useMemo(
    () => new Set(scenarios.map((s) => s.id)),
    [scenarios]
  );
  const canOpenAdd = scenarios.length < 3;

  const [bannerVisible, setBannerVisible] = useState(false);

  const showLimitBanner = () => {
    setBannerVisible(true);
    setTimeout(() => setBannerVisible(false), 2000);
  };

  const [visibleIds, setVisibleIds] = useState<(string | undefined)[]>(
    Array.from({ length: 11 }, () => undefined)
  );

  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [customMap, setCustomMap] = useState<
    Map<string, { id: string; name: string }>
  >(new Map());

  const [deck, setDeck] = useState<string[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    if (!pool.length) return;

    const allIds = pool.map((s) => s.id);
    const shuffled = shuffle(allIds);
    setDeck(shuffled);

    setVisibleIds((prev) => {
      const next = [...prev];
      for (let i = 0; i < 11; i++) {
        next[i] = shuffled[i] ?? undefined;
      }
      return next;
    });

    initializedRef.current = true;
  }, [pool]);

  useEffect(() => {
    if (!scenarios.length) return;

    setCustomMap((prev) => {
      const m = new Map(prev);
      scenarios.forEach((s) => {
        if (s.id.startsWith("custom:") && !m.has(s.id)) {
          m.set(s.id, { id: s.id, name: s.name });
        }
      });
      return m;
    });

    setPinnedIds((prev) => {
      const next = new Set(prev);
      scenarios.forEach((s) => {
        if (s.id.startsWith("custom:")) {
          next.add(s.id);
        }
      });
      return next;
    });
  }, [scenarios]);

  useEffect(() => {
    if (!pool.length) return;

    const selectedIds = scenarios.map((s) => s.id);
    if (!selectedIds.length) return;

    setVisibleIds((prev) => {
      const next = [...prev];
      const visibleSet = new Set(next.filter(Boolean) as string[]);
      let changed = false;

      for (const id of selectedIds) {
        if (visibleSet.has(id)) continue;

        const slot = next.findIndex((slotId, idx) => {
          if (idx >= 11) return false;
          if (!slotId) return true;
          if (selectedIds.includes(slotId)) return false;
          if (pinnedIds.has(slotId)) return false;
          return true;
        });

        if (slot === -1) {
          continue;
        }

        const oldId = next[slot];
        if (oldId && visibleSet.has(oldId)) {
          visibleSet.delete(oldId);
        }
        next[slot] = id;
        visibleSet.add(id);
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [scenarios, pinnedIds, pool]);

  const toggle = async (item: Scenario) => {
    const already = isSelected(item.id);
    if (!already && scenarios.length >= 3) return;
    if (already) {
      await deleteScenarioItem(item.id);
    } else {
      await addScenarioItem(item);
    }
  };

  const clearAll = async () => {
    if (scenarios.length === 0) return;
    await Promise.all(scenarios.map((s) => deleteScenarioItem(s.id)));
  };

  const handleOpenAdd = () => {
    if (!canOpenAdd) {
      showLimitBanner();
      return;
    }
    setShowAdd(true);
  };

  const handleConfirmAdd = (name: string) => {
    setShowAdd(false);
    const cid = `custom:${Date.now()}`;

    setCustomMap((prev) => {
      const m = new Map(prev);
      m.set(cid, { id: cid, name });
      return m;
    });

    setPinnedIds((prev) => {
      const s = new Set(prev);
      s.add(cid);
      return s;
    });

    setVisibleIds((prev) => {
      const next = [...prev];
      const selectedIds = scenarios.map((s) => s.id);

      const slot = next.findIndex((slotId, idx) => {
        if (idx >= 11) return false;
        if (!slotId) return true;
        if (selectedIds.includes(slotId)) return false;
        if (pinnedIds.has(slotId)) return false;
        return true;
      });

      if (slot === -1) {
        return prev;
      }

      next[slot] = cid;
      return next;
    });
  };

  const doDeleteCustom = async (id: string) => {
    if (isSelected(id)) {
      await deleteScenarioItem(id);
    }

    setPinnedIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });

    setCustomMap((prev) => {
      const m = new Map(prev);
      m.delete(id);
      return m;
    });

    setVisibleIds((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x === id);
      if (idx < 0 || idx >= 11) return next;

      const used = new Set(
        next
          .map((v, i) => (i === idx ? undefined : v))
          .filter(Boolean) as string[]
      );

      const selectedIds = scenarios
        .map((s) => s.id)
        .filter((sid) => sid !== id);
      const selectedSet2 = new Set(selectedIds);

      const pinnedSet2 = new Set(
        Array.from(pinnedIds).filter((pid) => pid !== id)
      );

      const candidates = pool
        .map((s) => s.id)
        .filter(
          (cid) =>
            !used.has(cid) &&
            !selectedSet2.has(cid) &&
            !pinnedSet2.has(cid)
        );

      next[idx] = candidates[0] ?? undefined;
      return next;
    });
  };

  const deleteCustom = (id: string) => {
    Alert.alert(
      "Remove custom scenario?",
      "This will delete your custom scenario and replace it with a random one.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void doDeleteCustom(id);
          },
        },
      ]
    );
  };

  const refresh = useCallback(() => {
    if (!pool.length) return;

    const selectedIds = scenarios.map((s) => s.id);
    const selectedLocal = new Set(selectedIds);

    const candidates = pool
      .map((s) => s.id)
      .filter((id) => !selectedLocal.has(id) && !pinnedIds.has(id));
    const shuffled = shuffle(candidates);
    setDeck(shuffled);

    let ptr = 0;

    setVisibleIds((prev) => {
      const next = [...prev];

      for (let i = 0; i < 11; i++) {
        const id = next[i];
        if (id && (selectedLocal.has(id) || pinnedIds.has(id))) {
          continue;
        }
        next[i] = shuffled[ptr++] ?? undefined;
      }

      return next;
    });
  }, [pool, scenarios, pinnedIds]);

  const goNext = () => {
    const chosen = scenarios;
    console.log("Next with IDs:", chosen.map((x) => x.id));
    console.log("Next with names:", chosen.map((x) => x.name));
    router.push("/shared/AIRecommendation");
  };

  const renderItem = ({ index }: { index: number }) => {
    if (index === 11) {
      return (
        <Pressable
          style={styles.cell}
          onPress={handleOpenAdd}
          disabled={!canOpenAdd}
        >
          <View
            style={[
              styles.add,
              {
                backgroundColor: color.enableAddScenarioBtnbg,
                borderColor: color.enableAddScenarioBtnborder,
              },
              !canOpenAdd && {
                backgroundColor: color.disableAddScenarioBtnbg,
                borderColor: color.disableAddScenarioBtnborder,
              },
            ]}
          >
            <FontAwesome5
              name="plus"
              size={28}
              color={
                canOpenAdd
                  ? color.enableAddScenario
                  : color.disableAddScenario
              }
            />
          </View>
          <Text
            style={[
              styles.addTxt,
              { color: color.text1 },
              !canOpenAdd && { color: color.disableAddScenario },
            ]}
          >
            Add
          </Text>
        </Pressable>
      );
    }

    const id = visibleIds[index];
    if (!id) return <View style={styles.cell} />;

    if (id.startsWith("custom:")) {
      const meta = customMap.get(id);
      if (!meta) return <View style={styles.cell} />;

      const sel = isSelected(id);
      const scenarioLike = { id, name: meta.name } as unknown as Scenario;

      return (
        <View style={styles.cell}>
          <ScenarioCard
            name={meta.name}
            faIconName="wine-glass"
            size={76}
            selected={sel}
            onPress={() => toggle(scenarioLike)}
            enableLongPressDelete
            onDelete={() => deleteCustom(id)}
            disabledSelect={!sel && scenarios.length >= 3}
            onDisabledPress={showLimitBanner}
          />
        </View>
      );
    }
    const item = id2item.get(id);
    if (!item) return <View style={styles.cell} />;
    const sel = isSelected(item.id);

    return (
      <View style={styles.cell}>
        <ScenarioCard
          name={item.name}
          iconKey={item.iconKey}
          size={76}
          selected={sel}
          onPress={() => toggle(item)}
          disabledSelect={!sel && scenarios.length >= 3}
          onDisabledPress={showLimitBanner}
        />
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={refresh} hitSlop={8} style={styles.leftBtn}>
            <FontAwesome5 name="sync-alt" size={20} color={color.btntext1} />
          </Pressable>

          {/* Quick Clear */}
          {/* <Pressable onPress={clearAll} hitSlop={8} style={[styles.leftBtn]}>
            <FontAwesome5 name="trash" size={18} color="brown" />
          </Pressable> */}
        </View>

        <View style={{ minWidth: 120, alignItems: "center" }}>
          {bannerVisible && (
            <Text
              style={{
                color: color.text3,
                fontSize: 13,
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              You can select up to 3 only!
            </Text>
          )}
        </View>

        {!isSave && (
          <Pressable onPress={goNext} hitSlop={8}>
            <Text style={[styles.next, { color: color.btntext1 }]}>Next</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        contentContainerStyle={styles.grid}
        data={Array.from({ length: 12 })}
        numColumns={3}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />

      <AddScenarioDialog
        visible={showAdd}
        onCancel={() => setShowAdd(false)}
        onConfirm={handleConfirmAdd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  topBar: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 2,
  },
  leftBtn: {
    padding: 6,
  },
  next: { fontSize: 16, fontWeight: "700" },
  grid: {
    gap: 16,
    paddingBottom: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cell: {
    width: "33.67%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  add: {
    width: "66%",
    height: "66%",
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  addTxt: {
    marginTop: 6,
    fontWeight: "600",
  },
});