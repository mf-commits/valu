// Détecte le type de lien vidéo (YouTube, Vimeo, Loom, fichier direct) et
// retourne l'URL à utiliser dans un <iframe> ou <video>, pour que la vidéo
// se prévisualise directement dans la page plutôt que d'ouvrir un onglet.

export type VideoEmbed =
  | { kind: "iframe"; src: string }
  | { kind: "file"; src: string }
  | { kind: "unknown"; src: string };

export function getVideoEmbed(url: string): VideoEmbed | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
      const shortMatch = parsed.pathname.match(/\/embed\/([\w-]+)/);
      if (shortMatch) return { kind: "iframe", src: url };
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.replace("/", "");
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.replace("/", "");
      if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
    }
    if (host === "loom.com") {
      const match = parsed.pathname.match(/\/share\/([\w-]+)/);
      if (match) return { kind: "iframe", src: `https://www.loom.com/embed/${match[1]}` };
    }
    if (/\.(mp4|webm|mov)$/i.test(parsed.pathname)) {
      return { kind: "file", src: url };
    }

    return { kind: "unknown", src: url };
  } catch {
    return null;
  }
}
