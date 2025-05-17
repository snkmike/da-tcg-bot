# Migration de Create React App (CRA) vers Vite

Ce document décrit les étapes effectuées pour migrer l'application da-tcg-bot de Create React App vers Vite, tout en maintenant la compatibilité HTTPS avec un nom de domaine personnalisé.

## Pourquoi migrer vers Vite ?

- **Performance** : Vite est significativement plus rapide que CRA grâce à son serveur de développement basé sur ESM natif
- **Flexibilité** : Configuration plus simple et flexible
- **Support HTTPS** : Support natif pour HTTPS, nécessaire pour certaines API
- **Support moderne** : Meilleur support pour les fonctionnalités modernes de JavaScript et TypeScript

## Configuration actuelle

L'application dispose maintenant de deux configurations parallèles :

1. **Configuration CRA d'origine** : `npm start`, `npm run build`
2. **Configuration Vite** : `npm run dev`, `npm run build:vite`

Cela permet une migration progressive, où vous pouvez revenir à CRA si nécessaire.

## Comment utiliser l'application avec Vite

### Démarrage simple

```bash
# Démarrer avec Vite en mode développement
npm run dev
```

### Démarrage avec HTTPS et nom de domaine personnalisé

```bash
# Utiliser le script qui configure automatiquement HTTPS
node scripts/start-https.js
```

Ce script vérifie et génère automatiquement les certificats si nécessaire, et démarre l'application en HTTPS.

## Fichiers clés de la migration

- `vite.config.js` : Configuration principale de Vite
- `index.html` : Point d'entrée HTML (à la racine du projet, pas dans /public)
- `src/cra-compat.js` : Couche de compatibilité pour les fonctionnalités spécifiques à CRA
- `package.json` : Scripts mis à jour
- `scripts/start-https.js` : Script utilitaire pour démarrer en HTTPS

## Compatibilité

Les fonctionnalités suivantes de CRA ont été maintenues dans Vite :

- Variables d'environnement `REACT_APP_*` (via un pont de compatibilité)
- La variable `process.env.PUBLIC_URL`
- Structure de dossiers CRA
- Configuration du HMR (Hot Module Replacement)

## Utilisation de HTTPS avec un nom de domaine personnalisé

La configuration HTTPS avec le nom de domaine personnalisé est intégrée à la configuration Vite. Pour démarrer l'application :

```bash
# Méthode automatisée recommandée
node scripts/start-https.js

# OU méthode manuelle
npm run dev
```

Voir le document `docs/https-et-ndd.md` pour plus de détails sur la configuration HTTPS.

## Prochaines étapes de la migration

Une fois que vous êtes à l'aise avec la configuration Vite, vous pouvez :

1. Supprimer progressivement les dépendances liées à CRA non utilisées
2. Optimiser davantage la configuration Vite 
3. Migrer entièrement vers la structure de projet Vite en renommant les scripts :
   ```json
   {
     "scripts": {
       "start": "vite", // Remplacer "react-scripts start"
       "build": "vite build", // Remplacer "react-scripts build"
       "preview": "vite preview" // Ajouter cette commande
     }
   }
   ```

## Résolution de problèmes

Si vous rencontrez des problèmes avec la configuration Vite :

1. Vérifiez les erreurs dans la console du navigateur
2. Assurez-vous que toutes les variables d'environnement nécessaires sont définies
3. Essayez de lancer avec le script automatisé : `node scripts/start-https.js`
4. Si nécessaire, revenez temporairement à CRA avec `npm start`

## Notes sur la compatibilité des API

Si votre application utilise des API qui nécessitent HTTPS, assurez-vous que :

1. Le domaine personnalisé est correctement configuré dans votre fichier hosts
2. Les certificats SSL sont correctement générés
3. La variable `VITE_SITE_URL` est définie dans `.env`
4. Les services tiers sont configurés pour autoriser les requêtes depuis votre domaine personnalisé
