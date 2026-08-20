// // Petit serveur qui reçoit la photo depuis l'appli et appelle Gemini côté serveur,
// pour ne jamais exposer la clé API dans l'appli mobile.
//
// Setup :
//   cd server && npm install
//  // GEMINI_API_KEY=ta_clé_gemini
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
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: mimeType || "image/jpeg",
                  data: image
                }
              },
              {
                text: ANALYSIS_PROMPT
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    console.error("Erreur Gemini :", errText);
    return res.status(502).json({
      error: "Échec de l'analyse"
    });
  }

  const data = await response.json();

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("") || "";

  const match = text.match(/\{[\s\S]*\}/);
  const clean = match ? match[0] : text;

  const parsed = JSON.parse(clean);

  res.json(parsed);

} catch (err) {
  console.error(err);
  res.status(500).json({
    error: "Erreur serveur"
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GlowScan backend en écoute sur le port ${PORT}`));
