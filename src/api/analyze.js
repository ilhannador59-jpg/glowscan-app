// Remplace par l'URL de ton backend une fois déployé (voir /server).
// En dev local avec Expo Go, utilise l'IP locale de ton ordinateur, pas "localhost".
const BACKEND_URL = "https://glowscan-server-59-2026-0605.onrender.com/analyze";

export async function analyzeFace(base64Image, mimeType = "image/jpeg") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ image: base64Image, mimeType }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Le serveur a répondu avec une erreur (${response.status})`);
    }

    const data = await response.json();
    if (!data || (data.score === undefined && data.score !== 0)) {
      throw new Error("Réponse inattendue du serveur");
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("L'analyse a pris trop de temps. Vérifie ta connexion et réessaie.");
    }
    throw err;
  }
}
