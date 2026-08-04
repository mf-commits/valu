import { companyConfig } from "@/lib/companyConfig";

export type LetterBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] };

// Lettre ouverte affichée au client avant la lecture du contrat, et incluse
// en page de garde du PDF signé. Modifie librement le contenu ci-dessous.
export const welcomeLetterBlocks: LetterBlock[] = [
  { type: "paragraph", text: "Merci d'être avec nous." },
  {
    type: "paragraph",
    text: "Merci d'envisager Services Valu non pas comme un fournisseur à qui demander les solutions les moins chères, mais comme un partenaire stratégique – une partie de votre équipe, de votre réflexion, de votre trajectoire.",
  },
  {
    type: "paragraph",
    text: "Parce qu'en vérité, ce qui nous anime n'est pas de vendre des services. C'est de créer de la valeur ensemble.",
  },
  { type: "heading", text: "Ce que nous cherchons" },
  {
    type: "paragraph",
    text: "Nous cherchons des clients qui comprennent une chose essentielle :",
  },
  {
    type: "paragraph",
    text: "Les vrais problèmes ne se résolvent pas avec les solutions simples. Ils demandent de la rigueur, de la stratégie, et la volonté de chercher le meilleur chemin – pas le plus rapide ou le moins cher, mais celui qui maximise vos résultats et crée de la vraie valeur.",
  },
  {
    type: "paragraph",
    text: "Nous travaillons mieux avec des gens qui sont attentifs, compréhensifs, humains, rigoureux. Qui demandent l'excellence. Et qui savent qu'on peut la livrer ensemble.",
  },
  { type: "heading", text: "Les points clés d'une bonne relation avec nous" },
  {
    type: "list",
    items: [
      "Voir au-delà du coût — Notre valeur ne se mesure pas en banque d'heures au rabais. Elle se mesure en résultats concrets, en stratégie qui tient, en expertise multidisciplinaire qu'on partage. Si vous cherchez à négocier à la baisse, vous allez ailleurs. Si vous cherchez à investir dans de vrais résultats, on se parle.",
      "Être exigeant avec nous — Posez-nous les bonnes questions. Demandez-nous de justifier nos recommandations. Demandez l'excellence. C'est là-dedans qu'on grandit ensemble, qu'on crée des choses qui marchent vraiment.",
      "Nous faire confiance — Pas aveuglément. Mais avec assez de recul pour laisser la stratégie se déployer. Les vraies stratégies prennent du temps pour montrer leur valeur. Les clients qu'on respecte le plus sont ceux qui nous donnent cet espace.",
      "Communiquer, vraiment — Pas de jeux politiques. Pas de silences qui durent. On veut parler de ce qui marche, de ce qui ne marche pas, des pivots nécessaires. On veut que vous soyez impliqué·e, actif·ve, participant·e à votre propre succès.",
      "Naviguer l'évolution ensemble — Le marketing change. Les outils changent. Les algorithmes changent. Les clients qu'on préfère sont ceux qui acceptent de rêver des changements avec nous, de s'adapter, d'explorer. Pas de « c'est comme ça qu'on a toujours fait ».",
    ],
  },
  { type: "heading", text: "Ce que vous pouvez attendre de nous" },
  {
    type: "paragraph",
    text: "Vous avez notre expertise multidisciplinaire : médias sociaux, publicité payante, SEO/GEO, branding, web, contenu. Pas de dilution. Pas d'« on verra ». Une vraie stratégie intégrée.",
  },
  {
    type: "paragraph",
    text: "Vous avez notre réactivité et notre créativité. Les PME qui travaillent avec nous trouvent une équipe qui bouge vite, qui teste, qui adapte, qui crée des choses qu'on ne voit pas ailleurs.",
  },
  {
    type: "paragraph",
    text: "Vous avez notre honnêteté. On vous dit quand on ne sait pas. On vous dit quand ça ne marche pas. On vous dit ce qui peut vraiment changer votre business. Et on vous le dit en mots simples, pas en jargon.",
  },
  {
    type: "paragraph",
    text: "Vous avez notre engagement. Quand on s'associe avec quelqu'un, ce n'est pas transactionnel. C'est un vrai partenariat. On travaille dur pour vos résultats. Chaque rapport. Chaque mois. Chaque année.",
  },
  { type: "paragraph", text: "Voilà ce qu'on cherche. Voilà ce qu'on offre." },
  {
    type: "paragraph",
    text: "Si ça résonne avec vous, on a une vraie conversation à avoir.",
  },
];

export function getWelcomeLetterSignoff(): string {
  return `${companyConfig.founderName}\n${companyConfig.founderTitle}, ${companyConfig.entrepriseNom}\n${companyConfig.website}`;
}

// Version texte brut, utilisée en page de garde du PDF.
export function getWelcomeLetterText(): string {
  const lines: string[] = [];
  welcomeLetterBlocks.forEach((block) => {
    if (block.type === "heading") {
      lines.push("", block.text.toUpperCase(), "");
    } else if (block.type === "paragraph") {
      lines.push(block.text, "");
    } else if (block.type === "list") {
      block.items.forEach((item, i) => lines.push(`${i + 1}. ${item}`, ""));
    }
  });
  lines.push("", getWelcomeLetterSignoff());
  return lines.join("\n");
}
