// Petit serveur qui reçoit la photo depuis l'appli et appelle Claude côté serveur,
// pour ne jamais exposer la clé API dans l'appli mobile.
//
// Setup :
//   cd server && npm install
//   export ANTHROPIC_API_KEY=sk-ant-...
//   node index.js
//
// Déploiement conseillé : Render, Railway ou Fly.io (gratuit pour démarrer).

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.get("/", (req, res) => {
  res.send("GlowScan API fonctionne !");
});
const ANALYSIS_PROMPT = `Tu es un outil d'analyse skincare bienveillant dans une appli mobile grand public. Analyse cette photo de visage et réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown, au format exact suivant:
{
  "score": <entier 0-100, score glow général>,
  "metrics": [
    {"label": "Hydratation", "value": <0-100>},
    {"label": "Éclat", "value": <0-100>},
    {"label": "Texture", "value": <0-100>},
    {"label": "Symétrie", "value": <0-100>}
  ],
  "constat": "<2 phrases courtes, ton bienveillant et positif, en français>",
  "routine": [
    {"time": "Matin", "step": "<étape courte>"},
    {"time": "Matin", "step": "<étape courte>"},
    {"time": "Soir", "step": "<étape courte>"},
    {"time": "Soir", "step": "<étape courte>"}
  ]
}
Reste toujours positif et encourageant, jamais critique ou anxiogène. Si le visage n'est pas clairement visible, mets score à 0 et explique dans "constat".`;

app.post("/analyze", async (req, res) => {
  const { image, mimeType } = req.body;
  if (!image) return res.status(400).json({ error: "Image manquante" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType || "image/jpeg", data: image } },
              { type: "text", text: ANALYSIS_PROMPT },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Erreur Anthropic:", errText);
      return res.status(502).json({ error: "Échec de l'analyse" });
    }

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    const match = text.match(/\{[\s\S]*\}/);
    const clean = (match ? match[0] : text).replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GlowScan backend en écoute sur le port ${PORT}`));
