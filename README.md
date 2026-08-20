# GlowScan — guide de démarrage

## 1. Le backend (à faire en premier)

```bash
cd server
npm install
export ANTHROPIC_API_KEY=sk-ant-ta-clé
npm start
```

Déploie-le ensuite sur **Render** ou **Railway** (gratuit pour démarrer) pour avoir une URL publique stable — ça prend 5-10 min. Sans ça, l'appli sur ton téléphone ne pourra pas joindre ton ordinateur.

## 2. Brancher l'URL du backend

Dans `src/api/analyze.js`, remplace :
```js
const BACKEND_URL = "https://TON-BACKEND.exemple.com/analyze";
```
par l'URL réelle de ton backend déployé.

## 3. RevenueCat

1. Crée un compte sur revenuecat.com (gratuit jusqu'à 2 500$/mois de revenus)
2. Crée le projet "GlowScan", ajoute tes produits (lifetime 19,99€, mensuel 9,99€)
3. Copie ta clé API publique dans `src/screens/PaywallScreen.js` (`REVENUECAT_API_KEY`)
4. Les vrais produits doivent aussi être créés dans App Store Connect / Google Play Console — RevenueCat les synchronise, mais c'est toi qui les déclares là-bas d'abord

## 4. Lancer l'appli

```bash
npm install
npx expo start
```

Un QR code apparaît dans le terminal. Installe **Expo Go** sur ton téléphone (App Store / Play Store), scanne le QR code — l'appli se lance directement sur ton téléphone.

Chaque fois qu'on modifie le code, il suffit de refermer/rouvrir l'appli dans Expo Go pour voir les changements (parfois automatique).

## 5. Publier pour de vrai

Une fois qu'on est contents du résultat, on passera par `eas build` (outil Expo) pour générer les vrais fichiers à soumettre sur l'App Store et le Google Play Store. Il te faudra à ce moment-là ton compte Apple Developer (99$/an) et Google Play (25$ une fois).
