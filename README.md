# VueVN – Refactor en packages NPM

Ce document résume le plan de transformation du framework **VueVN** (moteur, éditeur, scripts et templates) vers une architecture modulaire basée sur des packages NPM. L’objectif est de séparer le framework des projets de jeu pour faciliter :

- la maintenance de plusieurs jeux dans des dépôts Git distincts,
- la mise à jour du framework via `npm` ou `pnpm`,
- l’évolution collaborative sans conflit de branches ou de sous-dossiers `projects/`.

---

## Objectifs principaux

1. **Publier le moteur et l’éditeur sous forme de packages installables** (`@vuevn/core`).
2. **Convertir les scripts TypeScript** (dev, build, verify, etc.) **en une CLI indépendante** (`@vuevn/cli`).
3. **Externaliser les configurations Vite/Tailwind/PostCSS** dans un package réutilisable (`@vuevn/config`).
4. **Fournir un générateur de projet** (`create-vuevn`) permettant de créer un jeu minimal sans cloner le dépôt du framework.
5. **Documenter le workflow multi‑repo** pour que chaque jeu vive dans son propre dépôt Git tout en gardant le moteur à jour via NPM.

---

## Architecture cible

```
root
├── packages/
│   ├── core/       → moteur + helpers d’éditeur
│   ├── cli/        → binaire `vuevn` (dev, build, verify…)
│   ├── config/     → fonctions utilitaires de configuration Vite/Tailwind/PostCSS
│   └── create/     → binaire `create-vuevn` (scaffolding de projet)
├── docs/           → documentation officielle
└── examples/       → (optionnel) jeux d’exemple distincts
```

### 1. `@vuevn/core`
- Contient le **moteur** (`src/engine/`) et les **helpers d’éditeur** (`src/editor/`).
- Exporte des points d’entrée séparés :
  ```jsonc
  {
    "exports": {
      "./engine": "./dist/engine/index.js",
      "./editor": "./dist/editor/index.js"
    },
    "sideEffects": false,
    "type": "module"
  }
  ```
- L’éditeur n’est chargé qu’en mode développement via import dynamique :
  ```ts
  if (import.meta.env.DEV) { await import('@vuevn/core/editor'); }
  ```
- Le runtime de jeu n’importe que `@vuevn/core/engine`, ce qui permet à Rollup/Vite de **tree-shaker** l’éditeur en production.

### 2. `@vuevn/cli`
- Fournit la commande `vuevn` avec sous‑commandes :
  - `vuevn dev --project <path>` : lance Vite en mode éditeur (hot reload, import de l’éditeur).
  - `vuevn build --project <path>` : build du jeu final (import moteur uniquement).
  - `vuevn verify --project <path>` : scripts de validation (type-check, lint…).
- Accepte des options comme `--out-dir` pour personnaliser le dossier de génération (`generate`).
- Résout automatiquement les fichiers de configuration depuis `@vuevn/config`.

### 3. `@vuevn/config`
- Exporte des helpers pour Vite, Tailwind et PostCSS :
  ```ts
  export function getEditorViteConfig(projectPath: string): UserConfig;
  export function getGameViteConfig(projectPath: string): UserConfig;
  export function getTailwindConfig(projectPath: string): TailwindConfig;
  ```
- Permet à la CLI de charger les configs sans avoir à copier de fichiers dans chaque projet.

### 4. `create-vuevn`
- Génère un nouveau projet de jeu à partir d’un template minimal.
- Usage : `npx create-vuevn <nom-du-jeu>`
- Copie les fichiers nécessaires :
  ```
  game.html
  src/main.ts
  package.json (préconfiguré)
  ```
- Propose une initialisation interactive (nom du jeu, dossier cible, etc.).

### 5. Documentation & workflow

- **Créer un nouveau jeu**
  ```bash
  npx create-vuevn mon-jeu
  cd mon-jeu
  npm install @vuevn/core @vuevn/cli
  vuevn dev --project .
  ```
- **Mettre à jour le moteur**
  ```bash
  npm update @vuevn/core
  ```
- **Structure recommandée pour un projet de jeu**
  ```
  mon-jeu/
  ├── src/
  │   └── main.ts          (point d’entrée runtime)
  ├── game.html           (entrée HTML)
  ├── generate/           (dossier géré par la CLI, ignoré par Git)
  ├── package.json
  └── README.md
  ```

---

## Plan de mise en œuvre

### Étape 1 – Initialiser le monorepo
1. Créer un nouveau dépôt Git (ou une branche) avec `package.json` racine utilisant des **workspaces** (`packages/*`).
2. Ajouter `tsconfig.json` et `pnpm-workspace.yaml` (ou `npm` workspaces).
3. Déclarer quatre packages vides : `core`, `cli`, `config`, `create`.

### Étape 2 – Migrer le moteur et l’éditeur vers `@vuevn/core`
1. Déplacer `engine_src/` → `packages/core/src/engine`.
2. Déplacer `editor_src/` → `packages/core/src/editor`.
3. Mettre à jour les imports internes (`@engine/*`, `@editor/*`).
4. Configurer les scripts de build (ex : `tsc`, `vite build`).
5. Vérifier que l’éditeur n’est jamais importé en production (tests de build).

### Étape 3 – Créer la CLI `@vuevn/cli`
1. Déplacer les scripts `dev.cjs`, `build.cjs`, `verify.cjs`, etc. dans `packages/cli/src/`.
2. Exposer un binaire `vuevn` via `bin` dans `package.json`.
3. Implémenter les options `--project`, `--out-dir`, `--verbose`, `--ignore-translations`.
4. Consommer les configs depuis `@vuevn/config`.
5. Publier `@vuevn/cli` sur NPM.

### Étape 4 – Externaliser les configurations dans `@vuevn/config`
1. Déplacer `vite.config.js`, `vite.config.game.js`, `tailwind.config.js`, `postcss.config.js` dans `packages/config/`.
2. Exposer des fonctions `getEditorConfig`, `getGameConfig`, etc.
3. Adapter la CLI pour appeler ces fonctions plutôt que des fichiers locaux.
4. Tester le chargement de config sur un projet externe.

### Étape 5 – Scaffolding `create-vuevn`
1. Déplacer `template/project.zip` → `packages/create/templates/project`.
2. Écrire `packages/create/src/index.ts` qui décompresse le template, initialise `package.json`, installe les dépendances de base (optionnel).
2. Configurer un binaire `create-vuevn` dans `package.json`.
4. Documenter l’usage dans le README principal.

### Étape 6 – Documentation & exemples
1. Rédiger `docs/WORKFLOW.md` (workflow multi‑repo, mise à jour des packages, exemples de commandes).
2. Créer des **dépôts d’exemple** (3 jeux distincts) pour valider le fonctionnement.
3. Ajouter des guides de migration depuis l’ancienne architecture (monolithe vers packages).

---

## Points d’attention

- **Tree-shaking** : assurer que `@vuevn/core` est entièrement ESM et que les sections éditeur sont optionnelles (`sideEffects: false`).
- **Compatibilité des imports** : utiliser des alias ou chemins relatifs cohérents (`tsconfig.paths`, `vite.resolve.alias`).
- **CI & tests** : préparer des tests de build pour vérifier que l’éditeur n’est jamais inclus dans le bundle de production.
- **Versioning** : adopter un versionnement semver pour les packages (`core`, `cli`, `config`, `create`), et décider si le monorepo sera publié via `changeset`, `lerna`, ou autre.

---

## Exemple d’utilisation finale

1. **Création d’un projet**
   ```bash
   npx create-vuevn my-game
   cd my-game
   npm install @vuevn/core @vuevn/cli
   ```

2. **Développement**
   ```bash
   vuevn dev --project .
   # Ouvre l’éditeur (hot reload, outils) en utilisant `game.html` comme entrée.
   ```

3. **Build production**
   ```bash
   vuevn build --project .
   # Génère un fichier HTML unique (single-page) sans code d’éditeur.
   ```

4. **Mise à jour du moteur**
   ```bash
   npm update @vuevn/core
   ```

---

## Prochaines étapes immédiates

1. **Configurer le monorepo** et valider la structure des dossiers.
2. **Porter `engine_src` et `editor_src`** dans `packages/core` avec un build ESM.
3. **Adapter les scripts** actuels dans une CLI minimaliste (`vuevn dev` et `vuevn build`).
4. **Extraire les configs Vite/Tailwind** et assurer qu’elles s’appliquent à un projet extérieur.
5. **Préparer le scaffold** pour créer un projet de jeu autonome.
6. **Documenter** chaque étape pour faciliter la contribution et les migrations.

---

## Références et pistes

- Vite API (node): `vite.createServer`, `vite.build`.
- Rollup `manualChunks` pour séparer le runtime et l’éditeur.
- Packages monorepo: PNPM workspaces, changesets.
- Plugins: `vite-plugin-singlefile` pour la sortie finale.

---

Ce README peut être transmis à toute personne ou instance chargée de démarrer le nouveau package. Il contient les objectifs, la structure cible, le plan étape par étape et les exemples d’usage afin de lancer rapidement la migration vers un framework basé sur des packages NPM.

