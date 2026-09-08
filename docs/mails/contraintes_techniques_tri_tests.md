# [DNI] ProfilsActifs : tri déterministe du catalogue et tests de charge

**De :** Thomas Vignal <t.vignal@job-et-bonheur.fr>
**Date :** Mar 08/09/2026 09:44

---

Bonjour,

Thomas Vignal. Suite au retrait des compteurs d'engagement décidé hier, il reste un point technique que personne n'a traité et qui va vous exploser au visage en revue si vous ne l'anticipez pas.

Votre catalogue de profils n'a plus d'ordre de tri. Si le classement reposait implicitement sur l'engagement, vous avez aujourd'hui un ORDER BY qui n'existe plus, ou pire, un ordre non déterministe laissé au bon vouloir du moteur de base de données. Deux appels successifs à la même page peuvent renvoyer des profils différents et en oublier au passage. C'est un bug de pagination classique, et il se voit tout de suite.

## 1. Tri déterministe, documenté, et démontré

L'ordre par défaut du catalogue doit être explicite, stable et documenté. Ma suggestion : date de dernière mise à jour du profil décroissante, avec l'identifiant du profil en clé de départage. Deux colonnes dans le ORDER BY, jamais une seule.

Les tris proposés au recruteur doivent reposer sur des critères professionnels uniquement : secteur, localisation, disponibilité, statut de certification, date. Aucun critère de popularité, même dérivé, même indirect.

La démonstration, et c'est elle qui m'intéresse. Parcourez votre catalogue page par page, de la première à la dernière, et enregistrez la liste des identifiants dans l'ordre obtenu. Recommencez. Les deux listes doivent être identiques, sans doublon et sans manquant, et compter exactement le nombre de profils en base. Joignez les deux fichiers et le résultat de leur comparaison. Une affirmation ne vaut rien ici : deux exécutions, ça se prouve en trois minutes.

Et traitez le cas suivant, qui arrivera en démonstration : un profil est modifié pendant qu'un recruteur pagine. Avec un tri par date de mise à jour, ce profil remonte en tête et un autre disparaît de la page suivante. Vous ne pouvez pas l'empêcher facilement. Vous pouvez le documenter en trois lignes, dire quelle garantie vous offrez, et laquelle vous n'offrez pas. C'est ce que je noterai.

Une note d'une page décrivant l'algorithme de classement et les critères de filtrage disponibles. Florine me l'a redemandée ce matin, elle en a besoin pour son avis.

## 2. Tests de charge, c'est maintenant

Je vous avais annoncé la contrainte le premier jour. L'échéance est jeudi, avant la revue technique. Périmètre minimal :

500 profils en base, dont au moins 300 avec une vidéo associée. Générés par un script versionné dans le dépôt et relançable sur une base vide par quelqu'un qui n'est pas vous. Et les vidéos passent par votre interface de fournisseur, pas par une insertion directe en base : un jeu de données qui contourne votre propre code ne mesure rien.

100 utilisateurs simultanés parcourant le catalogue. k6, Locust, Artillery, JMeter, l'outil m'est indifférent. Le rapport ne l'est pas.

Un rapport de 2 pages : outil utilisé, scénario, temps de réponse médian et p95 sur les trois routes les plus sollicitées, nombre d'erreurs, et le goulot d'étranglement que vous avez identifié. Des chiffres mesurés chez vous, avec la date et la machine. Je reconnais un ordre de grandeur inventé, j'en lis toute l'année.

Joignez la sortie brute de l'outil, pas seulement votre synthèse. Et si vous corrigez quelque chose, donnez-moi les deux exécutions, avant et après, dans le même document. Un index ajouté qui divise un p95 par six, c'est la meilleure slide que vous puissiez avoir jeudi.

Si vous n'avez pas le temps de corriger le goulot, écrivez-le. Un rapport honnête qui dit « la route du catalogue s'écroule à 60 utilisateurs, cause probable : absence d'index sur updated_at » vaut infiniment mieux qu'un rapport optimiste. Je le dis sérieusement : la lucidité technique se note.

Dernier point. Entre le retour à la version 1 d'hier, la migration du questionnaire et ce que je viens de vous demander, je vois bien que le compte n'y est pas. Si vous ne pouvez pas tout tenir avant jeudi, écrivez-le-moi ce soir : ce que vous abandonnez, et pourquoi. Deux lignes par point, pas davantage. Je préfère une liste à une surprise, et une liste argumentée se défend en réunion. Un livrable manquant que personne n'a annoncé, non.

Cordialement,

Thomas Vignal - Conseiller numérique
Cabinet du Ministre - Ministère du Job et Bonheur

---

## DECISION TRACE & SUMMARY

**1. Accepted Requirements (Tri & Tests de Charge):**

- **Deterministic Sort**: Catalog must be sorted by `updatedAt` DESC, then `id` ASC. No popularity criteria.
- **Sort Proof**: A script must iterate all pages twice, record IDs, and prove identical results with no duplicates/missing profiles.
- **Edge Case Documentation**: Document the shifting pagination bug (when a profile updates during pagination).
- **Load Test Seed**: A script (`backend/prisma/load-test-seed.ts`) generating 500 profiles and 300 videos, using the `VideoProvider` interface.
- **Load Testing**: 100 concurrent users testing the top 3 routes using a tool (e.g., `autocannon`).
- **Reports**: A 1-page note on the sorting algorithm, and a 2-page report on the load test results (with raw output and bottleneck analysis).
