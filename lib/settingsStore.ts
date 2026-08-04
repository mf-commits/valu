import { getStore } from "@netlify/blobs";
import { companyConfig } from "@/lib/companyConfig";
import { DEFAULT_WELCOME_MESSAGE } from "@/lib/welcomeLetter";

// Paramètres modifiables depuis /parametres, sans toucher au code. Stockés
// dans Netlify Blobs ; si rien n'a encore été enregistré, on retombe sur les
// valeurs par défaut de companyConfig / welcomeLetter.

export type SiteSettings = {
  entrepriseNom: string;
  entrepriseAdresse: string;
  introVideoUrl: string;
  welcomeMessage: string;
};

function store() {
  return getStore("settings");
}

export function defaultSettings(): SiteSettings {
  return {
    entrepriseNom: companyConfig.entrepriseNom,
    entrepriseAdresse: companyConfig.entrepriseAdresse,
    introVideoUrl: companyConfig.introVideoUrl,
    welcomeMessage: DEFAULT_WELCOME_MESSAGE,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  const saved = (await store().get("config", { type: "json" })) as
    | Partial<SiteSettings>
    | null;
  return { ...defaultSettings(), ...(saved || {}) };
}

export async function saveSettings(
  update: Partial<SiteSettings>
): Promise<SiteSettings> {
  const current = await getSettings();
  // On ignore les clés absentes/undefined pour ne pas écraser une valeur
  // existante avec "rien" (ex. un champ non envoyé par le formulaire).
  const cleanUpdate = Object.fromEntries(
    Object.entries(update).filter(([, v]) => v !== undefined)
  );
  const next: SiteSettings = { ...current, ...cleanUpdate };
  await store().setJSON("config", next);
  return next;
}
