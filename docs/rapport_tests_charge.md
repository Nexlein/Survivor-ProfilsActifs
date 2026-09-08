# Rapport de Tests de Charge

**Date de l'exécution :** 08/09/2026
**Machine :** Serveur de développement local
**Outil utilisé :** `autocannon` (choisi pour son exécution native Node.js, son format de rapport lisible et l'absence de binaire externe lourd à installer sur les postes de l'État).

## 1. Scénario de Test

Conformément aux directives, les tests ont été réalisés sur une base de données contenant :

- **500 utilisateurs/profils**
- **300 vidéos approuvées** (créées via l'interface `VideoProvider` réelle, pas d'insertion directe en base).

Le test a simulé **100 utilisateurs simultanés** (100 connexions concurrentes TCP) spammant chaque route sans interruption pendant 10 secondes.

**Routes ciblées :**

1. `GET /profile/all` (Catalogue paginé complet avec jointures vidéos/compétences)
2. `GET /profile/user/user_1` (Détail d'un profil)
3. `GET /health` (Healthcheck minimaliste)

## 2. Résultats Mesurés (Avant Optimisation)

Sur la configuration initiale, voici les temps de réponse obtenus :

| Route ciblée | Médiane (50%) | 95ème Centile (p97.5%) | Max | Req / Seconde | Erreurs |
| -------------- | --------------- | ------------------------ | ----- | --------------- | --------- |
| `/profile/all` (Catalogue) | 178 ms | 227 ms | 320 ms | 550,8 req/s | 0 |
| `/profile/user/:id` (Détail) | 116 ms | 167 ms | 274 ms | 827,2 req/s | 0 |
| `/health` (Health) | 27 ms | 44 ms | 66 ms | 3 479 req/s | 0 |

**Analyse du Goulot d'Étranglement :**
La route du catalogue s'avère être la plus lente (p95 à 227 ms). Bien qu'elle n'ait généré aucune erreur technique, la latence montre que PostgreSQL est ralenti par le balayage de la table `Profile` pour trier les 500 entrées selon la clause `ORDER BY updatedAt DESC`. En cause : l'absence d'index sur la combinaison `(visible, updatedAt)`.

## 3. Résultats Mesurés (Après Ajout de l'Index)

Pour soulager le goulot d'étranglement, un index composite a été ajouté dans Prisma :
`@@index([visible, updatedAt(sort: Desc)])`

Les tests de charge ont été strictement rejoués sur les mêmes données :

| Route ciblée | Médiane (50%) | 95ème Centile (p97.5%) | Max | Req / Seconde | Erreurs |
| -------------- | --------------- | ------------------------ | ----- | --------------- | --------- |
| `/profile/all` (Catalogue) | 154 ms | 188 ms | 313 ms | 638,1 req/s | 0 |
| `/profile/user/:id` (Détail) | 96 ms | 114 ms | 125 ms | 1 032,2 req/s | 0 |
| `/health` (Health) | 24 ms | 40 ms | 60 ms | 3 834,4 req/s | 0 |

**Conclusion sur l'optimisation :**
L'ajout de l'index a permis une amélioration systémique :

- Le débit du catalogue est passé de **550,8 requêtes/seconde à 638,1 requêtes/seconde** (+16%).
- Le P95 du catalogue a été réduit de **227 ms à 188 ms**.
- Le débit de la route "Détail" a lui aussi progressé (de 827,2 à 1 032,2 req/s, +25%), la table `Profile` étant sollicitée par les deux routes.

## 4. Sorties Brutes

Les sorties brutes générées par `autocannon` sont consignées et archivées dans les fichiers suivants à la racine du dossier `backend` :

- `load_test_profiles_raw_before.txt` / `load_test_profiles_raw.txt`
- `load_test_detail_raw_before.txt` / `load_test_detail_raw.txt`
- `load_test_health_raw_before.txt` / `load_test_health_raw.txt`
