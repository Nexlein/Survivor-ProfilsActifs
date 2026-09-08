# Réponses Officielles aux Audits Ministériels

Ce document trace les réponses définitives aux points de vigilance soulevés par le Cabinet du Ministre.

## 1. Gestion des dates de naissance (Florine Pontaillac)
> *"Dites-moi également, en deux lignes, ce que vous faites des comptes déjà créés sans date de naissance, y compris ceux de vos jeux de démonstration."*

**Réponse Technique** : Les profils ne possédant pas de date de naissance (`dateOfBirth: null`) sont systématiquement masqués du catalogue public. La requête Prisma de pagination utilise le filtre exclusif `lte: 18_YEARS_AGO`, ce qui rejette automatiquement les valeurs nulles. Ils sont donc assimilés à des mineurs par précaution.

## 2. Droit à l'Oubli et Suppression (Florine Pontaillac)
> *"Et la révocation doit produire un effet réel, c'est-à-dire la suppression du fichier, pas le masquage de la fiche."*

**Réponse Technique** : La route `DELETE /video/delete` exécute un `fs.unlinkSync` sur la vidéo (`.mp4`) ET sur son sous-titre associé (`.vtt`). Les fichiers sont physiquement incinérés du disque dur avant même que la base de données ne soit nettoyée. Aucun `soft-delete` n'est appliqué aux fichiers médias.

## 3. Interruptions d'Upload (Thomas Vignal)
> *"Interruption d'upload : Décidez ce que devient un fichier partiel."*

**Stratégie** : En cas d'interruption réseau, le middleware `multer` conserve le fichier partiel sur le disque (fichier orphelin). Puisque la transaction en base de données n'aboutit jamais, ce fichier n'est rattaché à aucun profil. Un script cron système (`cleanup-orphans`) supprimera chaque nuit tout fichier présent dans `/uploads/videos/` depuis plus de 24h qui ne correspond à aucun UUID dans la table PostgreSQL `Video`.

## 4. Identité Visuelle - Le Pitch (Benjamin Sellami)
> *"Rédiger la phrase qui dit ce que fait ProfilsActifs (Une seule, moins de 20 mots) pour vendredi 12h."*

**Pitch Officiel (16 mots)** : *"ProfilsActifs connecte les talents authentiques aux recruteurs via des présentations vidéo certifiées et sans biais algorithmique."*

## 5. Réduction du Questionnaire à 20 Questions (Benjamin Sellami — Rollback Matignon)
> *"Quelles 20 questions, et selon quel critère. Écrivez-le, cinq lignes suffisent. [...] Il reste en base des réponses déjà enregistrées sur les 80 questions supprimées, et des badges déjà attribués sur un score calculé avec elles. Décidez [...] Un script rejouable pour ce traitement, avec le nombre de passations et de badges concernés avant et après."*

### Critère de sélection (5 lignes)

Le questionnaire actuel de 100 questions couvre 10 dimensions professionnelles transversales (10 questions chacune) : ponctualité, autonomie, travail en équipe, motivation, respect de la hiérarchie, gestion du stress, adaptabilité, rigueur, communication, valeurs du travail. Nous conservons 2 questions par dimension (2 × 10 = 20) pour préserver l'intégralité de la couverture fonctionnelle demandée par le cahier des charges (section 2.2, "aptitudes transversales : communication, organisation, adaptabilité"), plutôt que de supprimer des dimensions entières. Au sein de chaque dimension, nous gardons les deux premières questions du bloc : chacune offre un écart de 9 à 10 points entre la meilleure et la pire réponse (vérifié sur les 20 questions retenues), donc aucune n'est un "remplissage" à faible pouvoir de discrimination. Ce critère est mécanique et reproductible, pas un choix au cas par cas. La liste complète des 20 questions retenues est donnée ci-dessous et sera appliquée dans `certification/questions.v1.json` (version 2).

| Dimension | Questions conservées |
|---|---|
| Ponctualité & Présence | q-001, q-002 |
| Autonomie & Initiative | q-011, q-012 |
| Travail en équipe & Relationnel | q-021, q-022 |
| Motivation & Ambition | q-031, q-032 |
| Respect de la hiérarchie & Règles | q-041, q-042 |
| Gestion du stress & Résilience | q-051, q-052 |
| Adaptabilité & Flexibilité | q-061, q-062 |
| Rigueur & Qualité du travail | q-071, q-072 |
| Communication & Posture professionnelle | q-081, q-082 |
| Valeurs du Travail & Culture JEB | q-091, q-092 |

### Barème

Le score reste affiché sur 1000 points et le seuil de certification reste 700/1000 (`CERTIFICATION_THRESHOLD` inchangé) : la pondération (`weighting`) des 20 questions conservées passe de 1 à 5 (20 × 10 points max × pondération 5 = 1000). Aucun changement d'affichage côté interface (questionnaire, tableau de bord recruteur).

### Passations existantes — décision retenue : invalidation (recalcul techniquement impossible)

Vérification faite sur le modèle de données : seul le score agrégé (`totalScore`) est conservé après soumission, les réponses détaillées (`QuestionnaireProgress.answers`) sont supprimées à la validation du questionnaire (`submitQuestionnaire`, `backend/src/controllers/questionnaire.ts`). Il n'existe donc aucune trace, pour un candidat déjà certifié, de ses réponses question par question — un recalcul sur les 20 questions retenues est impossible à vérifier, pas seulement à éviter.

- Toute `QuestionnaireResult` liée à l'ancienne version du questionnaire (v1, 100 questions) est **invalidée** : `certificationScore` réinitialisé, `hasCertificationBadge` repassé à `false`, l'ancien résultat supprimé.
- Les passations en cours (non soumises) sont automatiquement réinitialisées par le mécanisme de versionnage déjà en place (`getCandidateProgression`, `questionnaireVersion`) — rien à faire de plus pour ce cas.
- **Aucun blocage d'accès au site** : la certification n'est plus un prérequis de visibilité (déjà acquis), donc un candidat invalidé reste consultable par les recruteurs, simplement sans badge affiché jusqu'à repassage.

### Script de traitement

Un script rejouable (`backend/scripts/migrate_questionnaire_v2.ts`, à livrer) appliquera cette règle à toutes les `QuestionnaireProgress`/`QuestionnaireResult` existantes et affichera un rapport avant/après : nombre total de passations, nombre de badges recalculés-conservés, nombre de badges invalidés, nombre de candidats à notifier. Sur l'environnement actuel (démonstrateur), l'état de la base avant traitement est de 1 passation et 1 résultat enregistrés — le script sera exécuté et son rapport fourni dès son écriture.
