# Plateforme de contrats en ligne

App Next.js (App Router) + Tailwind CSS + Netlify Blobs. Tu crées un contrat
en sélectionnant des services, chacun facturé en blocs d'heures × taux
horaire (le montant total s'additionne automatiquement), tu obtiens un lien
à envoyer au client. Le client voit d'abord une lettre de bienvenue (avec
vidéo intégrée), lit le contrat, paraphe les clauses clés, signe — un PDF
signé (lettre + contrat + initiales + certificat de traçabilité) est généré
et stocké. Toi et le client pouvez le retélécharger n'importe quand.

## Image de marque (logo et typographies)

- **Logo** : remplace `public/logo.svg` par le vrai logo de Services Valu
  (garde le nom de fichier `logo.svg`, ou change le chemin dans
  `components/Logo.tsx`).
- **Typographies** : dépose les fichiers de police dans `public/fonts/` —
  `Gamborino-Regular.woff2` pour les titres et `Switzer-Regular.woff2` /
  `Switzer-Medium.woff2` pour le texte courant. Les chemins sont déjà
  déclarés dans `app/globals.css` (`@font-face`). Tant que les fichiers n'y
  sont pas, le site retombe automatiquement sur des polices système
  proches, sans erreur.
- **Couleurs** : palette noir et blanc, définie dans `tailwind.config.js`
  (clé `colors.brand`). Ajuste les valeurs si tu veux un gris différent.

## Structure

```
app/
  page.tsx                    → tableau de bord (liste des contrats) — protégé
  login/page.tsx                → écran de mot de passe
  nouveau/page.tsx               → formulaire de création (services + lignes) — protégé
  parametres/page.tsx             → nom/adresse d'entreprise, vidéo, mot de bienvenue — protégé
  contrat/[id]/page.tsx           → page publique : bienvenue + lecture + signature
  api/contracts/route.ts           → POST : crée un contrat — protégé
  api/contracts/[id]/pdf/route.ts   → GET : télécharge le PDF signé
  api/sign/route.ts                  → POST : valide initiales + signature, génère le PDF
  api/auth/route.ts                   → POST : vérifie le mot de passe
  api/settings/route.ts                → GET/POST : paramètres modifiables — protégé
components/
  SignFlow.tsx          → bienvenue → lecture/initiales → signature → confirmation
  WelcomeLetter.tsx        → lettre ouverte + lien vidéo d'introduction
  SignatureCanvas.tsx        → canvas de signature/initiales, tactile + souris
  CopyLinkButton.tsx           → bouton « copier le lien »
lib/
  contractStore.ts        → lecture/écriture des contrats (Netlify Blobs)
  settingsStore.ts          → paramètres modifiables (Netlify Blobs), fallback sur companyConfig
  companyConfig.ts            → valeurs par défaut (utilisées tant que /parametres n'a rien enregistré)
  servicesCatalog.ts            → services proposés (catégories de lignes du contrat)
  welcomeLetter.ts                 → texte par défaut + conversion texte → blocs de la lettre de bienvenue
  contractContent.ts                 → gabarit de texte du contrat (Québec)
  pdfGenerator.ts                      → génération du PDF (pdf-lib)
  hash.ts                                → empreinte SHA-256 pour le certificat
middleware.ts            → protège /, /nouveau, /parametres par mot de passe
```

## Paramètres modifiables sans toucher au code

La page `/parametres` (bouton « Paramètres » sur le tableau de bord) permet de
changer, sans redéploiement :

- le nom et l'adresse de l'entreprise (repris dans le texte légal de chaque
  nouveau contrat) ;
- le lien de la vidéo d'introduction (YouTube, Vimeo, Loom) — s'affiche avec
  un aperçu cliquable sur l'écran de bienvenue du client dès qu'il est
  renseigné ;
- le mot de bienvenue affiché avant la lecture du contrat et inclus en page
  de garde du PDF signé. Sépare les paragraphes par une ligne vide ; une
  ligne qui commence par `## ` devient un sous-titre, des lignes qui
  commencent par `- ` deviennent une liste à puces.

Ces valeurs sont stockées dans Netlify Blobs (comme les contrats) — tant que
rien n'a été enregistré via `/parametres`, les valeurs par défaut de
`lib/companyConfig.ts` et `lib/welcomeLetter.ts` sont utilisées.

## Personnalisation par service et lignes du contrat

Sur `/nouveau`, tu coches les services proposés (définis dans
`lib/servicesCatalog.ts`) : chacun ajoute une ligne pré-remplie (label +
description) à la section « Portée des services » du contrat, que tu peux
éditer avant de créer le contrat. Le bouton « + Ajouter une ligne
personnalisée » permet d'ajouter des lignes qui ne sont pas dans le
catalogue. Modifie `lib/servicesCatalog.ts` pour ajuster tes services et
leurs descriptions par défaut.

## Facturation unique ou récurrente mensuelle

Sur `/nouveau`, choisis « Paiement unique » ou « Récurrent mensuel ». En mode
mensuel, le montant calculé à partir des lignes est présenté comme un
montant *mensuel* (pas de total annuel affiché ou mentionné dans le
contrat), avec une durée d'engagement optionnelle (en mois). Le texte légal
du contrat (article 3) s'ajuste automatiquement selon le mode choisi.

## Langue du contrat (Français / English)

Sur `/nouveau`, tu choisis « Français » ou « English » pour chaque contrat.
Ce choix détermine la langue du texte légal du contrat, de la lettre de
bienvenue et de toute la page vue par le client (jusqu'au PDF signé). Le
mot de bienvenue anglais se modifie séparément du français dans
`/parametres`. Rien à faire pour les contrats déjà créés — ils restent en
français.

## Autorisation par initiales

Avant de pouvoir cocher la case d'acceptation, le client doit parapher trois
clauses clés directement dans le navigateur (canvas tactile/souris, comme la
signature) : prix et modalités de paiement, résiliation, et limitation de
responsabilité. Ces paraphes sont enregistrés et intégrés au PDF signé, dans
une section « Initiales de confirmation ». Pour ajouter ou retirer des
clauses à parapher, modifie `INITIAL_CHECKPOINTS` dans
`components/SignFlow.tsx` (les clés doivent correspondre à celles vérifiées
dans `app/api/sign/route.ts`).

## Lettre de bienvenue et vidéo d'introduction

Avant de lire le contrat, le client voit une lettre de bienvenue (le texte
que tu as fourni, éditable dans `lib/welcomeLetter.ts`). Pour afficher un
lien vers ta vidéo d'introduction (« Bonjour et bienvenue chez Valu »),
ajoute son URL (YouTube, Loom, Vimeo...) dans `introVideoUrl` de
`lib/companyConfig.ts`. La lettre est aussi incluse en page de garde du PDF
signé.

## Démarrer en local

Le stockage utilise Netlify Blobs, qui a besoin du contexte Netlify pour
fonctionner (même en local) :

```bash
npm install
npm install -g netlify-cli   # une seule fois
netlify init                  # relie le dossier à ton site Netlify
cp .env.example .env.local    # ajoute WEBHOOK_URL et ADMIN_PASSCODE
netlify dev                    # au lieu de "npm run dev"
```

Ouvre http://localhost:8888.

## Personnaliser le contrat

Édite `lib/companyConfig.ts` une seule fois avec le nom, l'adresse et la
ville de juridiction de ton entreprise. Chaque contrat créé via `/nouveau`
réutilise ces informations avec les détails propres au client (nom, objet,
montant, modalités de paiement).

⚠️ Le texte fourni est un gabarit de départ inspiré des usages contractuels
au Québec (Code civil du Québec, Loi concernant le cadre juridique des
technologies de l'information). Ce n'est pas un avis juridique — fais-le
valider par un(e) avocat(e) avant un usage commercial.

## Comment ça marche

1. Tu vas sur `/nouveau`, tu remplis les infos du client (nom, courriel,
   objet des services, montant, modalités de paiement).
2. La plateforme crée un contrat (stocké dans Netlify Blobs) et te donne un
   lien du type `/contrat/<id>` à copier et envoyer au client.
3. Le client ouvre le lien, lit le contrat, coche la case d'acceptation,
   entre son nom et dessine sa signature.
4. Le serveur reconstruit le texte du contrat à partir des données
   enregistrées (jamais depuis ce que le navigateur envoie), capture IP et
   horodatage, calcule une empreinte SHA-256, génère le PDF avec le
   certificat de traçabilité, l'enregistre, et le fait télécharger
   automatiquement au client.
5. Si `WEBHOOK_URL` est défini, un événement `contract.signed` est envoyé à
   Make/Zapier.
6. Sur ton tableau de bord (`/`), le contrat passe au statut « Signé » avec
   un bouton pour retélécharger le PDF à tout moment.

## Sécurité

- `/` et `/nouveau` sont protégées par un mot de passe (`ADMIN_PASSCODE`).
  **Cette variable doit être ajoutée dans Netlify → Site settings →
  Environment variables** (elle n'est PAS déployée automatiquement depuis
  ton `.env.local`, qui reste seulement sur ta machine). Sans elle, ces
  pages restent ouvertes à quiconque a l'URL, sans aucune page de connexion.
- Où trouver la page de connexion : elle n'a pas de lien visible — dès que
  `ADMIN_PASSCODE` est configuré, visiter `/` te redirige automatiquement
  vers `/login`. Si tu ne vois jamais cet écran, c'est presque toujours que
  la variable n'est pas encore définie sur Netlify (ou que le site n'a pas
  été redéployé depuis que tu l'as ajoutée — redéploie après l'avoir
  configurée). Un lien « Se déconnecter » apparaît en haut du tableau de
  bord une fois connecté(e).
- Les liens `/contrat/<id>` sont volontairement publics (comme HelloSign ou
  DocuSign) : la sécurité repose sur le fait que l'identifiant est un UUID
  impossible à deviner. Ne les partage qu'avec le bon client.
- Un contrat déjà signé ne peut pas être signé une deuxième fois.

## Déployer sur Netlify

1. Pousse ce dossier dans un dépôt Git (GitHub/GitLab/Bitbucket).
2. Sur [app.netlify.com](https://app.netlify.com), « Add new site » →
   « Import an existing project » → connecte le dépôt. Netlify détecte
   Next.js et installe lui-même le Next.js Runtime — inutile de déclarer
   `@netlify/plugin-nextjs` manuellement dans `netlify.toml` (voir
   commentaire dans ce fichier si tu veux le forcer).
3. Netlify Blobs est activé automatiquement pour ton site, aucune
   configuration supplémentaire n'est nécessaire.
4. Dans **Site settings → Environment variables**, ajoute :
   - `WEBHOOK_URL` — ton scénario Make ou Zap (optionnel)
   - `ADMIN_PASSCODE` — le mot de passe du tableau de bord (fortement
     recommandé)
5. Déploie.

### Alternative : Netlify CLI

```bash
netlify env:set WEBHOOK_URL "https://hook.make.com/xxxx"
netlify env:set ADMIN_PASSCODE "ton-mot-de-passe"
netlify deploy --prod
```

## Si le déploiement échoue avec une erreur `@netlify/plugin-nextjs`

C'est presque toujours parce qu'un plugin est déclaré dans `netlify.toml`
sans être installé comme dépendance. Ce projet laisse Netlify le détecter
automatiquement (rien à faire). Si l'erreur persiste, vérifie dans les logs
de build le message exact — les causes les plus fréquentes sont une version
de Node trop ancienne (`NODE_VERSION` est fixée à 20 ici) ou un cache de
build corrompu (bouton « Clear cache and deploy site » dans Netlify).

## Prochaines améliorations possibles

- Envoyer automatiquement le PDF par courriel au client et à toi (Resend,
  Postmark, ou via le scénario Make branché sur le webhook).
- Ajouter une vraie authentification (au lieu d'un mot de passe partagé) si
  plusieurs personnes doivent créer des contrats.
- Permettre de modifier un contrat en attente ou de le supprimer.
