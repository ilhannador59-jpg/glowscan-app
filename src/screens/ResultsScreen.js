import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Sparkles, ChevronRight } from "lucide-react-native";
import { colors } from "../theme";

function ScoreRing({ value, size = 180 }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.pink} />
            <Stop offset="100%" stopColor={colors.teal} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringValue}>{value}</Text>
        <Text style={styles.ringLabel}>SCORE GLOW</Text>
      </View>
    </View>
  );
}

export default function ResultsScreen({ route, navigation }) {
  const { result } = route.params;

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>RÉSULTAT</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.ringWrap}>
          <ScoreRing value={result.score} />
        </View>

        <View style={styles.metrics}>
          {result.metrics.map((m) => (
            <View key={m.label} style={{ marginBottom: 12 }}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${m.value}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={15} color={colors.pink} />
            <Text style={styles.cardLabel}>CONSTAT</Text>
          </View>
          <Text style={styles.cardText}>{result.constat}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={() => navigation.navigate("Routine", { routine: result.routine })}>
          <Text style={styles.buttonText}>Voir ma routine</Text>
          <ChevronRight size={16} color={colors.bg} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { fontFamily: "monospace", fontSize: 11, letterSpacing: 3, color: colors.textMuted, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
  scroll: { paddingHorizontal: 24, paddingBottom: 16 },
  ringWrap: { alignItems: "center", paddingVertical: 16 },
  ringCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  ringValue: { fontFamily: "monospace", fontSize: 36, color: colors.text },
  ringLabel: { fontSize: 10, letterSpacing: 2, color: colors.textMuted },
  metrics: { marginTop: 24 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metricLabel: { fontSize: 14, color: colors.textBody },
  metricValue: { fontFamily: "monospace", fontSize: 14, color: colors.textMuted },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3, backgroundColor: colors.teal },
  card: { marginTop: 24, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  cardLabel: { fontFamily: "monospace", fontSize: 11, letterSpacing: 2, color: colors.textMuted },
  cardText: { fontSize: 14, lineHeight: 20, color: colors.textBody },
  footer: { paddingHorizontal: 24, paddingVertical: 20 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.text, paddingVertical: 16, borderRadius: 999 },
  buttonText: { color: colors.bg, fontWeight: "500", fontSize: 14 },
});
