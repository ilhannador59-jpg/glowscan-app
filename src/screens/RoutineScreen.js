import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Sun, Moon, TrendingUp, Lock } from "lucide-react-native";
import { colors } from "../theme";

export default function RoutineScreen({ route, navigation }) {
  const { routine } = route.params;

  return (
    <View style={styles.screen}>
      <Text style={styles.label}>TA ROUTINE</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>4 étapes, générées pour toi</Text>

        <View style={{ marginTop: 20, gap: 12 }}>
          {routine.map((r, i) => {
            const Icon = r.time === "Soir" ? Moon : Sun;
            return (
              <View key={i} style={styles.item}>
                <View style={styles.iconWrap}>
                  <Icon size={16} color={colors.pink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTime}>{r.time.toUpperCase()}</Text>
                  <Text style={styles.itemStep}>{r.step}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.hint}>
          <TrendingUp size={18} color={colors.teal} />
          <Text style={styles.hintText}>Suivi photo hebdo pour voir ta progression réelle sur 30 jours</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={() => navigation.navigate("Paywall")}>
          <Lock size={14} color={colors.bg} />
          <Text style={styles.buttonText}>Débloquer le suivi complet</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  label: { fontFamily: "monospace", fontSize: 11, letterSpacing: 3, color: colors.textMuted, paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
  scroll: { paddingHorizontal: 24, paddingBottom: 16 },
  title: { fontSize: 22, fontStyle: "italic", color: colors.text },
  item: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  itemTime: { fontFamily: "monospace", fontSize: 10, letterSpacing: 2, color: colors.textMuted },
  itemStep: { fontSize: 14, color: colors.textBody, marginTop: 2 },
  hint: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16, padding: 16, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderStyle: "dashed", borderColor: colors.borderDashed },
  hintText: { flex: 1, fontSize: 14, color: colors.textMuted },
  footer: { paddingHorizontal: 24, paddingVertical: 20 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.text, paddingVertical: 16, borderRadius: 999 },
  buttonText: { color: colors.bg, fontWeight: "500", fontSize: 14 },
});
