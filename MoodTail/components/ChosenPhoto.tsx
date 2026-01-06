import { useLocation } from "@/context/LocationContext";
import { usePhoto } from "@/context/PhotoContext";
import { useCustomColors } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import EmptyRadialPlus from "./EmptyRadialPlus";

/**
 * Picture of the date
 */
export default function ChosenPhoto() {
  const color = useCustomColors();
  const { photoUri, setPhoto, deletePhoto } = usePhoto();
  const { address } = useLocation();

  const [isPreviewVisible, setPreviewVisible] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);

  const openPreview = () => {
    if (photoUri) {
      setPreviewVisible(true);
    }
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Need Permission",
        "Need access permission to photo to choose picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (result.canceled || !result.assets?.length) return;

    const uri = result.assets[0].uri;
    await setPhoto(uri);
    setAspectRatio(null);
  };

  const remove = () => {
    if (!photoUri) return;

    Alert.alert(
      "Remove photo?",
      "This will clear today's picture.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deletePhoto();
            setAspectRatio(null);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { textShadowColor:color.text1, color: color.text1 }]}>Picture of the date</Text>
        <View style={styles.headerButtons}>
          {photoUri && (
            <Pressable
              onPress={remove}
              style={styles.editBtn}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={18} color="#7A5A22" />
            </Pressable>
          )}

          <Pressable onPress={pickPhoto} style={styles.editBtn} hitSlop={8}>
            <Ionicons name="create-outline" size={18} color="#7A5A22" />
          </Pressable>
        </View>
      </View>

      <Pressable onPress={photoUri ? openPreview : pickPhoto}>
        {photoUri ? (
          <View style={{ backgroundColor: color.photoSecbg1, marginTop:10,borderRadius:20,borderColor:color.btnborder1, borderWidth:1,paddingBottom:10, }}>
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: photoUri }}
                style={[
                  styles.photo,
                  aspectRatio ? { aspectRatio } : { height: 180 },
                ]}
                contentFit="contain"
                transition={200}
                onLoad={(e: any) => {
                  try {
                    const { width, height } = e?.source ?? {};
                    if (width && height) {
                      setAspectRatio(width / height);
                    }
                  } catch (err) {
                    console.warn("onLoad get size failed", err);
                  }
                }}
              />
            </View>

            {!!address && (
              <View style={styles.locRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#B08C4A"
                />
                <Text style={styles.locText} numberOfLines={2}>
                  {address}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <EmptyRadialPlus onPress={pickPhoto} />
          // <View
          //   style={[
          //     styles.emptyBox,
          //     { backgroundColor: color.photoSecbg2, borderColor:color.btnborder1, borderWidth:0.6 },
          //   ]}
          // >
          //   <FontAwesome5
          //     name="plus"
          //     size={28}
          //     color={color.enableAddScenario}
          //   />
          // </View>
        )}
      </Pressable>

      {photoUri && (
        <Modal
          visible={isPreviewVisible}
          transparent
          animationType="fade"
          onRequestClose={closePreview}
        >
          <Pressable style={styles.modalOverlay} onPress={closePreview}>
            <View style={styles.modalContent}>
              <Image
                source={{ uri: photoUri }}
                style={styles.modalImage}
                contentFit="contain"
              />
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    paddingVertical: 14,
    // backgroundColor: "rgba(255, 253, 247, 0)",
    borderWidth: 1,
    borderColor: "rgba(242, 212, 137, 0)",
    // marginTop: 12,
  },
  header: { flexDirection: "row", alignItems: "center" },
  title: {
    fontSize: 16, fontWeight: "600",
    textShadowOffset: { width: -5, height: 10 },
    textShadowRadius: 15,
  },
  editBtn: {
    marginLeft: "auto",
    borderWidth: 1,
    borderColor: "#F2D489",
    backgroundColor: "#FFF4CF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  headerButtons: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  photoWrapper: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF4CF",
    marginHorizontal:10,
  },
  photo: {
    width: "100%",
    borderRadius: 12,
  },

  emptyBox: {
    marginTop: 10,
    height: 150,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 6,
  },
  locText: {
    fontSize: 12,
    color: "#6C5A2E",
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});
