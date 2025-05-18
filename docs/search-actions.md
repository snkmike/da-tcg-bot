# Actions Réalisées Lors d'une Recherche

Ce document décrit les étapes et actions réalisées par l'application lors d'une recherche dans la base de données des cartes.

## Étapes Principales

### 1. **Initialisation de la Recherche**
- L'utilisateur saisit une requête dans la barre de recherche (composant `SearchBox`).
- Les paramètres de recherche incluent :
  - Nom ou mot-clé de la carte.
  - Filtres appliqués (extension, rareté, prix, etc.).
  - Options de tri (par nom, prix, numéro de collection).

### 2. **Envoi de la Requête**
- La fonction `fetchLorcanaData` (fichier `src/utils/api/fetchLorcanaData.js`) est appelée avec les paramètres de recherche.
- Cette fonction :
  - Formate les paramètres pour l'API.
  - Envoie une requête HTTP à l'API Lorcana pour récupérer les données correspondantes.

### 3. **Traitement des Résultats**
- Les résultats de l'API sont reçus et traités :
  - Les cartes sont filtrées localement si nécessaire (par exemple, pour des critères non pris en charge par l'API).
  - Les cartes sont triées selon les préférences de l'utilisateur.

### 4. **Affichage des Résultats**
- Les résultats sont affichés dans le composant `LorcanaResults` :
  - Les cartes sont rendues via le composant `SearchCardItem`.
  - Les résultats peuvent être groupés par extension si l'option est activée.

### 5. **Interactions Utilisateur**
- L'utilisateur peut :
  - Sélectionner des cartes pour les ajouter à une collection.
  - Modifier les filtres ou les options de tri pour affiner les résultats.
  - Voir les détails d'une carte en cliquant dessus.

## Composants et Fichiers Clés

- **Composants** :
  - `SearchBox` : Barre de recherche.
  - `SearchFilters` : Filtres de recherche.
  - `LorcanaResults` : Affichage des résultats.
  - `SearchCardItem` : Composant pour chaque carte dans les résultats.

- **Fichiers Utilitaires** :
  - `src/utils/api/fetchLorcanaData.js` : Gestion des requêtes API.
  - `src/components/utils/lorcanaCardUtils.js` : Fonctions utilitaires pour les cartes.

## Diagramme Simplifié

```text
[SearchBox] --> [fetchLorcanaData] --> [LorcanaResults]
     |                |                     |
     v                v                     v
[SearchFilters]   [Traitement]       [SearchCardItem]
```

Ce flux montre comment les données circulent de l'entrée utilisateur à l'affichage des résultats.

---

Pour toute question ou amélioration, veuillez consulter la documentation ou contacter l'équipe de développement.
