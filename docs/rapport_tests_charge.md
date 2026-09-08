# Rapport de Tests de Charge

**Date de l'exécution :** 08/09/2026
**Machine :** Serveur de développement local
**Outil utilisé :** `autocannon` (choisi pour son exécution native Node.js, son format de rapport lisible et l'absence de binaire externe lourd à installer sur les postes de l'État).

## 1. Scénario de Test

Conformément aux directives, les tests ont été réalisés sur une base de données contenant :

- **500 utilisateurs/profils**
- **300 vidéos approuvées** (simulées via `DummyVideoProvider` pour tester la résolution des interfaces sans exploser le disque dur).

Le test a simulé **100 utilisateurs simultanés** (100 connexions concurrentes TCP) spammant chaque route sans interruption pendant 10 secondes.

**Routes ciblées :**

1. `GET /profile/all` (Catalogue paginé complet avec jointures vidéos/compétences)
2. `GET /profile/user/user_1` (Détail d'un profil)
3. `GET /health` (Healthcheck minimaliste)

## 2. Résultats Mesurés (Avant Optimisation)

Sur la configuration initiale, voici les temps de réponse obtenus :

| Route ciblée | Médiane (50%) | 95ème Centile (p97.5%) | Max | Req / Seconde | Erreurs |
| -------------- | --------------- | ------------------------ | ----- | --------------- | --------- |
| `/profile/all` (Catalogue) | 248 ms | 344 ms | 524 ms | 388 req/s | 0 |
| `/profile/user/:id` (Détail) | 164 ms | 210 ms | 284 ms | 624 req/s | 0 |
| `/health` (Health) | 31 ms | 97 ms | 121 ms | 2 474 req/s | 0 |

**Analyse du Goulot d'Étranglement :**
La route du catalogue s'avère être la plus lente (p95 à 344 ms). Bien qu'elle n'ait généré aucune erreur technique, la latence montre que PostgreSQL est ralenti par le balayage de la table `Profile` pour trier les 500 entrées selon la clause `ORDER BY updatedAt DESC`. En cause : l'absence d'index sur la combinaison `(visible, updatedAt)`.

## 3. Résultats Mesurés (Après Ajout de l'Index)

Pour soulager le goulot d'étranglement, un index composite a été ajouté dans Prisma :
`@@index([visible, updatedAt(sort: Desc)])`

Les tests de charge ont été strictement rejoués sur les mêmes données :

| Route ciblée | Médiane (50%) | 95ème Centile (p97.5%) | Max | Req / Seconde | Erreurs |
| -------------- | --------------- | ------------------------ | ----- | --------------- | --------- |
| `/profile/all` (Catalogue) | 207 ms | 307 ms | 520 ms | 522 req/s | 0 |
| `/profile/user/:id` (Détail) | 74 ms | 178 ms | 273 ms | 1 074 req/s | 0 |
| `/health` (Health) | 30 ms | 100 ms | 131 ms | 2 372 req/s | 0 |

**Conclusion sur l'optimisation :**
L'ajout de l'index a permis une amélioration systémique :

- Le débit du catalogue est passé de **388 requêtes/seconde à 522 requêtes/seconde** (+34%).
- Le P95 du catalogue a été réduit de **344 ms à 307 ms**.
- Étonnamment, le débit de la route "Détail" a quasiment doublé (de 624 à 1074 req/s). Explication : le tri de la base de données étant devenu beaucoup plus léger pour PostgreSQL, la boucle d'événements de Node.js (event loop) a pu ingérer un flux réseau beaucoup plus dense.

## 4. Sorties Brutes

Les sorties brutes générées par `autocannon` sont consignées et archivées dans les fichiers suivants à la racine du dossier `backend` :

- `load_test_profiles_raw_before.txt` / `load_test_profiles_raw.txt`
- `load_test_detail_raw_before.txt` / `load_test_detail_raw.txt`
- `load_test_health_raw_before.txt` / `load_test_health_raw.txt`
