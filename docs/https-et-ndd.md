# Configuration HTTPS pour votre application avec un nom de domaine local

Si vous avez besoin d'une configuration HTTPS locale avec un nom de domaine personnalisé (pas localhost), voici comment procéder :

## Méthode simplifiée (recommandée)

Nous avons créé un script qui automatise toutes ces étapes. Exécutez simplement :

```bash
npm run dev:https
```

Ce script vérifiera et configurera automatiquement :
1. Les certificats SSL pour votre domaine
2. La configuration de votre fichier `.env`
3. Le démarrage de l'application en HTTPS

## Configuration manuelle étape par étape

Si vous préférez configurer manuellement, voici les étapes détaillées :

### 1. Configurer un nom de domaine local

#### Modifier votre fichier hosts

✅ Ajoutez cette ligne dans votre fichier `hosts` :
```
127.0.0.1   dev.tcgbot.local
```
Sur Windows, ouvrez le fichier `C:\Windows\System32\drivers\etc\hosts` en tant qu'administrateur pour effectuer cette modification.

### 2. Générer des certificats pour votre domaine personnalisé

✅ Utilisez `mkcert` pour générer des certificats SSL :
```bash
mkcert dev.tcgbot.local
```

✅ Cela générera deux fichiers :
- `dev.tcgbot.local.pem` (certificat)
- `dev.tcgbot.local-key.pem` (clé privée)

### 3. Configurer Vite avec votre domaine personnalisé

Modifiez votre fichier de configuration Vite (`vite.config.js`) pour inclure HTTPS :

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'dev.tcgbot.local-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'dev.tcgbot.local.pem')),
    },
    host: 'dev.tcgbot.local',
    port: 443, // Port HTTPS standard
  },
});
```

### 4. Mettre à jour vos variables d'environnement

Ajoutez ou mettez à jour votre fichier `.env` :

```
VITE_SITE_URL=https://dev.tcgbot.local
```

### 5. Exécuter en tant qu'administrateur

Pour utiliser le port 443 (port HTTPS standard), vous devrez lancer votre application en tant qu'administrateur :

```bash
npm run dev
```

Si vous ne pouvez pas utiliser le port 443, choisissez un autre port (par exemple 3000) et accédez à votre site via `https://dev.tcgbot.local:3000`.

## 6. Mise à jour des services tiers

Si vous utilisez des services tiers qui nécessitent d'enregistrer des URLs de redirection (comme Supabase, OAuth, etc.) :

1. Mettez à jour les URLs de redirection dans les dashboards de ces services pour pointer vers `https://dev.tcgbot.local/callback` (ou l'URL appropriée).
2. Assurez-vous que vos jetons d'API et configurations permettent les requêtes depuis ce domaine.

## Remarques importantes

- Cette configuration nécessite des droits administrateur pour le port 443.
- Si vous travaillez en équipe, chaque membre devra effectuer cette configuration localement.
- Pour les APIs tierces qui nécessitent une validation de domaine, un nom de domaine personnalisé peut parfois faciliter le processus par rapport à `localhost`.

Cette configuration offre une expérience de développement plus proche de votre environnement de production tout en maintenant les avantages d'un environnement local.