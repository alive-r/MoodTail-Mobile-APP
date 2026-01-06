import { useCustomColors } from "@/context/ThemeContext";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (name: string) => void;
};

export default function AddScenarioDialog({ visible, onCancel, onConfirm }: Props) {
  const color = useCustomColors();

  const [name, setName] = useState("");

  const handleConfirm = () => {
    const val = name.trim();
    if (val.length === 0) return;
    onConfirm(val);
    setName("");
  };

  const handleCancel = () => {
    setName("");
    onCancel();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleCancel}>
      <View style={styles.mask}>
        <View style={[styles.card, {backgroundColor:color.newScenariodialogbg, borderColor:color.newScenariodialogborder}]}>
          <Text style={[styles.title, {color: color.text1}]}>Add your scenario</Text>
          <TextInput
            style={[styles.input,{backgroundColor:color.newScenariodialoginputbg, borderColor:color.newScenariodialoginputborder, color:color.newScenariodialoginputtext}]}
            placeholder="e.g. Celebrate with friends"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
          <View style={styles.row}>
            <Pressable onPress={handleCancel} style={[styles.btn, {backgroundColor:color.newScenariodialogcancelbg}]}>
              <Text style={styles.btnTxt}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleConfirm} style={[styles.btn,{backgroundColor:color.newScenariodialogokbg}]}>
              <Text style={[styles.btnTxt, { color: "#2b2b2b" }]}>Add</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnTxt: { fontWeight: "600", color: "#6E562A" },
});
