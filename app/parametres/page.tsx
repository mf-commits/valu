"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Settings = {
  entrepriseNom: string;
  entrepriseAdresse: string;
  introVideoUrl: string;
  introVideoUrlEn: string;
  welcomeMessage: string;
  welcomeMessageEn: string;
};

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => setError("Impossible de charger les paramètres."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inattendue.");
      setSettings(data);
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <p className="text-sm text-slate-400">Chargement…</p>
      </main>
    );
  }

  if (!settings) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
        <p className="text-sm text-red-500">{error || "Erreur inattendue."}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-10 sm:py-16">
      <div>
        <Link href="/" className="text-xs font-medium text-brand-600 hover:underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="font-title mt-2 text-2xl font-semibold tracking-tight">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ces informations sont réutilisées dans chaque nouveau contrat et sur
          l&apos;écran de bienvenue vu par tes clients.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nom de l&apos;entreprise
          </label>
          <input
            type="text"
            value={settings.entrepriseNom}
            onChange={(e) =>
              setSettings({ ...settings, entrepriseNom: e.target.value })
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Adresse de l&apos;entreprise
          </label>
          <input
            type="text"
            value={settings.entrepriseAdresse}
            onChange={(e) =>
              setSettings({ ...settings, entrepriseAdresse: e.target.value })
            }
            placeholder="Utilisée dans le texte légal du contrat"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Lien de la vidéo d&apos;introduction — Français (optionnel)
          </label>
          <input
            type="url"
            value={settings.introVideoUrl}
            onChange={(e) =>
              setSettings({ ...settings, introVideoUrl: e.target.value })
            }
            placeholder="https://www.youtube.com/watch?v=... , loom.com/share/..., vimeo.com/..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Montrée sur l&apos;écran de bienvenue des contrats créés en
            français.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Intro video link — English (optional)
          </label>
          <input
            type="url"
            value={settings.introVideoUrlEn}
            onChange={(e) =>
              setSettings({ ...settings, introVideoUrlEn: e.target.value })
            }
            placeholder="https://www.youtube.com/watch?v=... , loom.com/share/..., vimeo.com/..."
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Shown on the welcome screen of contracts created in English.
            YouTube, Vimeo and Loom links show a clickable preview directly on
            the page. Leave either field empty to show nothing for that
            language.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Mot de bienvenue — Français
          </label>
          <textarea
            value={settings.welcomeMessage}
            onChange={(e) =>
              setSettings({ ...settings, welcomeMessage: e.target.value })
            }
            rows={12}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Sépare les paragraphes par une ligne vide. Une ligne qui commence
            par <code className="rounded bg-slate-100 px-1">## </code> devient
            un sous-titre. Des lignes qui commencent par{" "}
            <code className="rounded bg-slate-100 px-1">- </code> deviennent
            une liste à puces.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Welcome message — English
          </label>
          <textarea
            value={settings.welcomeMessageEn}
            onChange={(e) =>
              setSettings({ ...settings, welcomeMessageEn: e.target.value })
            }
            rows={12}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs leading-relaxed focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-400">
            Utilisé seulement pour les contrats créés en anglais. Même
            convention d&apos;écriture que ci-dessus.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
            Paramètres enregistrés.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </main>
  );
}
