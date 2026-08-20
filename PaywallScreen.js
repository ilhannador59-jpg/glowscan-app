import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Purchases from "react-native-purchases";
import { Sparkles, X, Check } from "lucide-react-native";
import { colors } from "../theme";

// Remplace par ta clé publique RevenueCat (Project settings > API keys).
const REVENUECAT_API_KEY = "TA_CLE_REVENUECAT";

export default function PaywallScreen({ navigation }) {
  const [offering, setOffering] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    Purchases.getOfferings()
      .then((offerings) => {
        const current = offerings.current;
        setOffering(current);
        if (current?.availablePackages?.length) {
          setSelected(current.availablePackages[0]);
        }
      })
      .catch((err) => console.error("Erreur RevenueCat:", err))
      .finally(() => setLoading(false));
  }, []);

  const handlePurchase = async () => {
    if (!selected) return;
    setPurchasing(true);
    try {
      await Purchases.purchasePackage(selected);
      navigation.navigate("Scan");
    } catch (err) {
      if (!err.userCancelled) console.error("Erreur achat:", err);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.closeRow}>
        <Pressable onPress={() => navigation.goBack()}>
          <X size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.eyebrow}>
          <Sparkles size={16} color={colors.pink} />
          <Text style={styles.eyebrowText}>GLOWSCAN PREMIUM</Text>
        </View>
        <Text style={styles.title}>Débloque ton évolution complète</Text>

        <View style={{ marginTop: 24, gap: 10 }}>
          {["Routine détaillée + produits recommandés", "Suivi photo illimité, comparaisons 30/60/90 jours", "Nouveaux scans hebdo pour ajuster ta routine"].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.checkDot}>
                <Check size={12} color={colors.bg} />
              </View>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.pink} style={{ marginTop: 32 }} />
        ) : (
          <View style={{ marginTop: 28, gap: 12 }}>
            {offering?.availablePackages?.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => setSelected(pkg)}
                style={[styles.planCard, selected?.identifier === pkg.identifier && styles.planCardActive]}
              >
                <View style={styles.planRow}>
                  <View>
                    <Text style={styles.planTitle}>{pkg.product.title}</Text>
                    <Text style={styles.planSub}>{pkg.product.description}</Text>
                  </View>
                  <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                </View>
              </Pressable>
            ))}
            {!offering && (
              <Text style={styles.noOffering}>
                Aucune offre configurée pour l'instant — connecte tes produits dans le dashboard RevenueCat.
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handlePurchase} disabled={!selected || purchasing}>
          {purchasing ? <ActivityIndicator color={colors.bg} /> : <Text style={styles.buttonText}>Continuer</Text>}
        </Pressable>
        <Text style={styles.footerNote}>Annulable à tout moment · Paiement sécurisé</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  closeRow: { alignItems: "flex-end", paddingHorizontal: 20, paddingTop: 56 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
  eyebrow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  eyebrowText: { fontFamily: "monospace", fontSize: 11, letterSpacing: 3, color: colors.textMuted },
  title: { fontSize: 26, fontStyle: "italic", color: colors.text, lineHeight: 32 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center" },
  featureText: { fontSize: 14, color: colors.textBody, flex: 1 },
  planCard: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  planCardActive: { borderColor: colors.pink, borderWidth: 1.5, backgroundColor: colors.surface },
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planTitle: { fontSize: 14, fontWeight: "500", color: colors.text },
  planSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  planPrice: { fontFamily: "monospace", fontSize: 18, color: colors.text },
  noOffering: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingVertical: 20 },
  button: { alignItems: "center", justifyContent: "center", backgroundColor: colors.text, paddingVertical: 16, borderRadius: 999 },
  buttonText: { color: colors.bg, fontWeight: "500", fontSize: 14 },
  footerNote: { textAlign: "center", fontSize: 11, color: colors.textFaint, marginTop: 12 },
});
