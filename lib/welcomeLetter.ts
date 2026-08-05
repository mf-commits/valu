import { companyConfig } from "@/lib/companyConfig";

export type LetterBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

// Lettre ouverte affichée au client avant la lecture du contrat, et incluse
// en page de garde du PDF signé. Ce texte est le contenu PAR DÉFAUT — il est
// désormais modifiable depuis /parametres (stocké dans Netlify Blobs) sans
// toucher au code. Convention d'écriture : une ligne qui commence par "## "
// devient un sous-titre, des lignes qui commencent par "- " (l'une après
// l'autre) deviennent une liste à puces, tout le reste devient un paragraphe.
// Les blocs sont séparés par une ligne vide.
export const DEFAULT_WELCOME_MESSAGE = `Merci d'être avec nous.

Merci d'envisager Services Valu non pas comme un fournisseur à qui demander les solutions les moins chères, mais comme un partenaire stratégique – une partie de votre équipe, de votre réflexion, de votre trajectoire.

Parce qu'en vérité, ce qui nous anime n'est pas de vendre des services. C'est de créer de la valeur ensemble.

## Ce que nous cherchons

Nous cherchons des clients qui comprennent une chose essentielle :

Les vrais problèmes ne se résolvent pas avec les solutions simples. Ils demandent de la rigueur, de la stratégie, et la volonté de chercher le meilleur chemin – pas le plus rapide ou le moins cher, mais celui qui maximise vos résultats et crée de la vraie valeur.

Nous travaillons mieux avec des gens qui sont attentifs, compréhensifs, humains, rigoureux. Qui demandent l'excellence. Et qui savent qu'on peut la livrer ensemble.

## Les points clés d'une bonne relation avec nous

- Voir au-delà du coût — Notre valeur ne se mesure pas en banque d'heures au rabais. Elle se mesure en résultats concrets, en stratégie qui tient, en expertise multidisciplinaire qu'on partage. Si vous cherchez à négocier à la baisse, vous allez ailleurs. Si vous cherchez à investir dans de vrais résultats, on se parle.
- Être exigeant avec nous — Posez-nous les bonnes questions. Demandez-nous de justifier nos recommandations. Demandez l'excellence. C'est là-dedans qu'on grandit ensemble, qu'on crée des choses qui marchent vraiment.
- Nous faire confiance — Pas aveuglément. Mais avec assez de recul pour laisser la stratégie se déployer. Les vraies stratégies prennent du temps pour montrer leur valeur. Les clients qu'on respecte le plus sont ceux qui nous donnent cet espace.
- Communiquer, vraiment — Pas de jeux politiques. Pas de silences qui durent. On veut parler de ce qui marche, de ce qui ne marche pas, des pivots nécessaires. On veut que vous soyez impliqué·e, actif·ve, participant·e à votre propre succès.
- Naviguer l'évolution ensemble — Le marketing change. Les outils changent. Les algorithmes changent. Les clients qu'on préfère sont ceux qui acceptent de rêver des changements avec nous, de s'adapter, d'explorer. Pas de « c'est comme ça qu'on a toujours fait ».

## Ce que vous pouvez attendre de nous

Vous avez notre expertise multidisciplinaire : médias sociaux, publicité payante, SEO/GEO, branding, web, contenu. Pas de dilution. Pas d'« on verra ». Une vraie stratégie intégrée.

Vous avez notre réactivité et notre créativité. Les PME qui travaillent avec nous trouvent une équipe qui bouge vite, qui teste, qui adapte, qui crée des choses qu'on ne voit pas ailleurs.

Vous avez notre honnêteté. On vous dit quand on ne sait pas. On vous dit quand ça ne marche pas. On vous dit ce qui peut vraiment changer votre business. Et on vous le dit en mots simples, pas en jargon.

Vous avez notre engagement. Quand on s'associe avec quelqu'un, ce n'est pas transactionnel. C'est un vrai partenariat. On travaille dur pour vos résultats. Chaque rapport. Chaque mois. Chaque année.

Voilà ce qu'on cherche. Voilà ce qu'on offre.

Si ça résonne avec vous, on a une vraie conversation à avoir.`;

// Version anglaise par défaut — modifiable séparément dans /parametres. Sert
// uniquement pour les contrats créés avec la langue "English".
export const DEFAULT_WELCOME_MESSAGE_EN = `Thank you for being here.

Think of Services Valu not as a vendor to squeeze for the cheapest option, but as a strategic partner — part of your team, your thinking, your trajectory.

Because the truth is, what drives us isn't selling services. It's creating value together.

## What we're looking for

We're looking for clients who understand one essential thing:

Real problems aren't solved with simple solutions. They demand rigor, strategy, and the willingness to find the best path — not the fastest or cheapest one, but the one that maximizes your results and creates real value.

We do our best work with people who are attentive, understanding, human, and rigorous. Who ask for excellence. And who know we can deliver it together.

## The keys to a good relationship with us

- Look beyond the cost — Our value isn't measured in discounted hourly banks. It's measured in real results, in strategy that holds up, in the multidisciplinary expertise we share. If you're looking to negotiate down, you're better off elsewhere. If you're looking to invest in real results, let's talk.
- Hold us to a high standard — Ask us the right questions. Ask us to justify our recommendations. Demand excellence. That's where we grow together, where we build things that actually work.
- Trust us — Not blindly. But with enough perspective to let the strategy play out. Real strategies take time to show their value. The clients we respect most are the ones who give us that space.
- Communicate, for real — No politics. No silence that drags on. We want to talk about what's working, what isn't, and what pivots are needed. We want you involved, active, and part of your own success.
- Navigate change with us — Marketing changes. Tools change. Algorithms change. The clients we prefer are the ones willing to imagine change with us, to adapt, to explore. Not "that's how we've always done it."

## What you can expect from us

You get our multidisciplinary expertise: social media, paid advertising, SEO/GEO, branding, web, content. No dilution. No "we'll see." A real, integrated strategy.

You get our responsiveness and creativity. The small and medium businesses that work with us find a team that moves fast, tests, adapts, and creates things you won't see anywhere else.

You get our honesty. We tell you when we don't know. We tell you when something isn't working. We tell you what could really change your business. And we say it in plain words, not jargon.

You get our commitment. When we partner with someone, it's not transactional. It's a real partnership. We work hard for your results. Every report. Every month. Every year.

That's what we're looking for. That's what we offer.

If this resonates with you, we have a real conversation to have.`;

// Convertit le texte modifiable (voir convention ci-dessus) en blocs typés
// utilisés pour l'affichage et le PDF.
export function parseWelcomeMessage(text: string): LetterBlock[] {
  const blocks: LetterBlock[] = [];
  const chunks = (text || "").replace(/\r\n/g, "\n").split(/\n\s*\n/);

  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "heading", text: trimmed.replace(/^##\s*/, "") });
      continue;
    }

    const lines = trimmed
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length > 0 && lines.every((l) => l.startsWith("- "))) {
      blocks.push({
        type: "list",
        items: lines.map((l) => l.replace(/^-\s*/, "")),
      });
      continue;
    }

    blocks.push({ type: "paragraph", text: lines.join(" ") });
  }

  return blocks;
}

export function getWelcomeLetterSignoff(entrepriseNom?: string): string {
  return `${companyConfig.founderName}\n${companyConfig.founderTitle}, ${
    entrepriseNom || companyConfig.entrepriseNom
  }\n${companyConfig.website}`;
}

// Version texte brut, utilisée en page de garde du PDF.
export function getWelcomeLetterText(
  blocks: LetterBlock[],
  signoff: string
): string {
  const lines: string[] = [];
  blocks.forEach((block) => {
    if (block.type === "heading") {
      lines.push("", block.text.toUpperCase(), "");
    } else if (block.type === "paragraph") {
      lines.push(block.text, "");
    } else if (block.type === "list") {
      block.items.forEach((item, i) => lines.push(`${i + 1}. ${item}`, ""));
    }
  });
  lines.push("", signoff);
  return lines.join("\n");
}
