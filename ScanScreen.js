import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, Pressable, StyleSheet, Animated } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Upload, AlertCircle } from "lucide-react-native";
import { colors } from "../theme";
import { analyzeFace } from "../api/analyze";

export default function ScanScreen({ navigation }) {
  const [image, setImage] = useState(null); // { uri, base64, mimeType }
  const [status, setStatus] = useState("idle"); // idle | analyzing | error
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scanLine, {
      toValue: progress,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startFakeProgress = () => {
    setProgress(0);
    progressTimer.current = setInterval(() => {
      setProgress((p) => (p >= 92 ? p : Math.min(p + (p < 60 ? 3 : 1), 92)));
    }, 220);
  };
  const stopFakeProgress = (final) => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(final);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setStatus("error");
      setErrorMsg("Autorise l'accès à l'appareil photo dans les réglages pour continuer.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, base64: asset.base64, mimeType: "image/jpeg" });
      setStatus("idle");
    }
  };

  const analyze = async () => {
    if (!image) return;
    setStatus("analyzing");
    setErrorMsg("");
    startFakeProgress();
    try {
      const result = await analyzeFace(image.base64, image.mimeType);
      stopFakeProgress(100);
      setTimeout(() => navigation.navigate("Results", { result }), 350);
    } catch (err) {
      stopFakeProgress(0);
      setStatus("error");
      setErrorMsg(err.message || "L'analyse a échoué. Réessaie avec une photo bien éclairée.");
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>GLOWSCAN · ANALYSE</Text>
      <View style={styles.center}>
        <Text style={styles.title}>Cadre ton visage{"\n"}dans la lumière naturelle</Text>

        <Pressable
          onPress={status !== "analyzing" ? pickImage : undefined}
          style={styles.frame}
        >
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Upload size={28} color={colors.text} />
              <Text style={styles.placeholderText}>Touche pour prendre une photo</Text>
            </View>
          )}
          {status === "analyzing" && (
            <View style={styles.overlay}>
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    top: scanLine.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>
          )}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </Pressable>

        {status === "error" && (
          <View style={styles.errorBox}>
            <AlertCircle size={14} color={colors.pink} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {status === "analyzing" ? (
          <Text style={styles.progressText}>Analyse en cours · {progress}%</Text>
        ) : (
          <Pressable onPress={image ? analyze : pickImage} style={styles.button}>
            <Camera size={17} color={colors.bg} />
            <Text style={styles.buttonText}>{image ? "Lancer le scan" : "Prendre une photo"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 3,
    color: colors.textMuted,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  title: {
    fontSize: 24,
    fontStyle: "italic",
    color: colors.text,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 32,
  },
  frame: {
    width: 224,
    height: 288,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.6 },
  placeholderText: { color: colors.textMuted, fontSize: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,14,17,0.45)" },
  scanLine: { position: "absolute", left: 0, right: 0, height: 2, backgroundColor: colors.teal },
  corner: { position: "absolute", width: 20, height: 20, borderColor: colors.pink },
  cornerTL: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 8 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 8 },
  cornerBL: { bottom: 12, left: 12, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 12, right: 12, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 8 },
  errorBox: { flexDirection: "row", gap: 8, marginBottom: 16, maxWidth: 240, alignItems: "flex-start" },
  errorText: { color: colors.pink, fontSize: 12, flex: 1 },
  progressText: { fontFamily: "monospace", color: colors.teal, fontSize: 14 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.text,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonText: { color: colors.bg, fontWeight: "500", fontSize: 14 },
});
