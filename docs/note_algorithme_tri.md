# Note Technique : Algorithme de Classement du Catalogue

## 1. Description de l'Algorithme de Tri

Suite à la suppression des compteurs d'engagement (vues, likes), le catalogue public des candidats n'utilise **plus aucun critère de popularité** pour son ordre d'affichage.

Le tri par défaut est désormais strictement temporel et déterministe. Il repose sur les deux critères suivants :

1. **Date de dernière mise à jour (`updatedAt`) en ordre décroissant** : Les profils récemment modifiés ou créés apparaissent en premier.
2. **Identifiant unique (`id`) en ordre croissant** : En cas d'égalité stricte de milliseconde sur la mise à jour, l'identifiant technique sert de clé de départage.

**Pourquoi cette double clé ?**
Sans la deuxième clé (identifiant), le moteur PostgreSQL pourrait retourner les ex-aequos dans un ordre aléatoire d'une requête à l'autre, provoquant l'apparition de doublons ou la disparition de candidats lors de la pagination par les recruteurs.

## 2. Filtres Disponibles

Les recruteurs disposent exclusivement de filtres à visée **professionnelle** :

- **Secteur d'activité** (`industry`)
- **Localisation** (`location` ou code postal)
- **Compétences validées** (`skills`)
- **Statut de certification** (Candidat certifié ou non)

*Avertissement formel : Toute tentative de filtrer, trier ou déduire un score d'engagement de manière détournée via l'API a été bloquée par le backend (cf. constante `FORBIDDEN_POPULARITY_QUERY_PARAMS`).*

## 3. Limite Technique Documentée (Décalage de Pagination)

**Scénario d'usage :**
Un recruteur consulte actuellement la page 2 du catalogue. À ce moment précis, un candidat qui se trouvait sur la page 4 met à jour son profil (ajout d'une compétence).
La date `updatedAt` de ce candidat devient la plus récente : il est propulsé en tête de la page 1.
Conséquence : tous les autres candidats reculent d'une place. Le candidat qui était en dernière position de la page 2 "tombe" sur la page 3. Si le recruteur passe ensuite à la page 3, il verra ce candidat apparaître à nouveau (doublon visuel).

**Garanties offertes et non offertes :**

- ✅ **Garantie** : Si aucun candidat ne modifie son profil pendant votre navigation, la pagination est 100% stable, complète, sans doublon, et mathématiquement prouvée (voir rapport d'exécution `sorting_proof_report.txt`).
- ❌ **Non garanti** : Nous ne figeons pas l'ordre temporel au moment de l'ouverture du catalogue (snapshot). Les modifications en temps réel peuvent induire un léger décalage des résultats entre deux clics "Page Suivante". C'est un compromis assumé pour garantir des performances optimales sans stocker d'état en mémoire.
