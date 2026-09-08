# Journal des modifications — Rollback Matignon (retour v1.0)

Réponse à l'instruction de Benjamin Sellami du 07/09/2026 (`docs/mails/retour_version_1.md`). Chaque ligne correspond à une modification réelle du dépôt, avec l'instruction qu'elle traite. Commits identifiés par hash court (`git show <hash>` pour le détail complet) ; le travail non encore commité est marqué comme tel.

## Point 1 — Langage droits sociaux / allocations

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| 07/09 16:32 | `5fce7c0` | Éradication du vocabulaire interdit dans les documents légaux et de suivi | Pt.1 |
| 08/09 (vérification) | — | Recherche exhaustive sur le dépôt (`allocation`, `droits sociaux`, `seuil d'activité`, `chômage`, `RSA`, etc.) — code, migrations, tests, i18n, données de démo, doc API : **zéro occurrence** | Pt.1 (rapport brut demandé) |

## Point 2 — Compteurs d'engagement publics

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| Antérieur à ce rollback (mesures conservatoires du 02/09) | — | Aucun nombre de likes/vues affiché (fiche publique, fiche recruteur, catalogue, réponses API) — la donnée reste en base, seules les sorties sont coupées | Pt.2 |
| 08/09 (vérification) | — | Confirmé sur `profils/[id]/page.tsx`, `Card.tsx`, `dashboard/recruiter/page.tsx` : le bouton "J'aime" reste une action privée (toggle), pas un compteur public | Pt.2 |

## Point 3 — Feed vertical → grille paginée

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| Antérieur à ce rollback | — | Grille de profils paginée (20/page), lecture vidéo au clic — déjà en place | Pt.3 |
| 08/09 (vérification) | — | Recherche dans tout l'historique git : aucune route de feed plein écran n'a jamais existé dans ce dépôt. Rien à rediriger. Confirmé avec Gustave. | Pt.3 |

## Point 4 — "Permis de Travailler" → "Badge de certification"

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| 07/09 16:33 | `b564937` | Renommage `hasPermisDeTravailler` → `hasCertificationBadge` en base de données | Pt.4 |
| 07/09 16:33 | `daf13d9` | Mise à jour du texte UI et des typages API pour le badge de certification | Pt.4 |
| 07/09 17:07 | `7ab8f8e` | Valeur par défaut ajoutée sur `hasCertificationBadge` dans `QuestionnaireResult` | Pt.4 |
| 08/09 09:38 | `f922a04` | Dernières occurrences de "Permis de Travailler" éliminées des données de démonstration du questionnaire (2 questions) | Pt.4 |
| 08/09 (vérification) | — | Recherche finale sur le dépôt : plus aucune occurrence de "Permis de Travailler", champ `hasCertificationBadge` cohérent partout (front + back) | Pt.4 |

## Point 5 — Questionnaire 100 → 20 questions

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| 08/09 10:26 | `c71b7cf` | `certification/questions.v1.json` réduit à 20 questions (2 par dimension professionnelle, critère de sélection documenté), pondération ajustée (barème conservé sur 1000, seuil 700 inchangé), version passée à 2 | Pt.5.a (critère de sélection) |
| 08/09 10:26 | `c71b7cf` | `backend/scripts/migrate_questionnaire_v2.ts` créé — script rejouable, invalide les résultats liés à l'ancienne version (recalcul vérifié impossible : les réponses détaillées ne sont pas conservées après soumission), nettoie les passations en cours obsolètes, affiche les statistiques avant/après | Pt.5.b + Pt.5.c (traitement des passations existantes + script avec stats) |
| 08/09 10:26 | `c71b7cf` | `docs/reponses_juridiques.md` §5 — justification de 5 lignes du critère de sélection + liste complète des 20 questions retenues + décision documentée sur les anciennes passations | Pt.5.a (justification écrite demandée) |
| 08/09 (vérification) | — | **Bug découvert et corrigé pendant la vérification** : `backend/src/controllers/questionnaire.ts` ignorait le champ `weighting` dans le calcul du score (invisible tant que la pondération valait 1 partout, devenu visible avec la pondération à 5). Corrigé dans le même commit `c71b7cf`. Re-testé : score parfait = 1000/1000, pires réponses = 20/1000, seuil 700 fonctionnel. | Pt.5 (intégrité du barème) |
| 08/09 (vérification) | — | Script de migration exécuté deux fois sur les données de démo : 1er passage → 1 résultat invalidé (badge retiré, score réinitialisé), 2e passage → idempotent, rien à traiter | Pt.5.c (stats avant/après) |

## Point 6 — Nom de travail du Ministre ("JibJob")

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| 07/09 16:04 | `a8fc5df` | Création des spécifications fonctionnelles définitives comme document de suivi unique | Pt.6 (traçabilité) |
| 07/09 16:05 | `36168fc` | Liens de documentation racine mis à jour vers les specs ProfilsActifs | Pt.6 |
| 07/09 16:14 | `f15dba1` | Réécriture de `project_hierarchy.md` pour refléter le rollback Matignon et le bannissement du nom | Pt.6 |
| 08/09 (vérification) | — | Recherche sur le dépôt : "JibJob" absent du produit, présent uniquement dans les documents qui décrivent son interdiction (contexte correct, aucune action requise) | Pt.6 |

## Bandeau permanent

| Date | Commit | Modification | Instruction |
|---|---|---|---|
| 08/09 (non commité) | — | `frontend/src/components/layout/LegalBanner.tsx` créé — bandeau permanent (non fermable), texte exact, rendu au-dessus du `Header` dans `layout.tsx` (donc sur toutes les pages, y compris erreur/404 qui héritent du layout racine). Affiché pour visiteur anonyme ou `JOB_SEEKER`, masqué pour `RECRUITER`/`ADMIN` connectés. | "Ce que vous ajoutez" |
| 08/09 (vérification) | — | Vérifié visuellement (capture d'écran) sur accueil, connexion et page 404 — bandeau présent, texte conforme, non tronqué | idem |

## Parcours vérifiés de bout en bout (inscription, dépôt vidéo, consultation recruteur)

| Date | Modification | Instruction |
|---|---|---|
| 08/09 (vérification) | Inscription candidat testée via l'API réelle — compte créé, connexion réussie | "Ce qui doit continuer de marcher" |
| 08/09 (vérification) | Dépôt vidéo testé via l'API réelle (`POST /profile/videos`) — upload accepté, statut `PENDING` (modération a priori intacte) | idem |
| 08/09 (vérification) | Consultation recruteur testée via l'API réelle — profil récupéré, interaction `VIEW` enregistrée | idem |

## Hors périmètre de ce mail (fait au passage, checklist interne de l'équipe)

| Date | Commit | Modification |
|---|---|---|
| 08/09 (non commité) | — | Suppression de `frontend/src/app/admin/questionnaire/page.tsx` (page factice, aucune route CRUD n'existait derrière) et du lien de navigation correspondant. Vérifié côté backend : aucun modèle `Question`/`Option` ni route CRUD à supprimer (déjà fait lors du passage au questionnaire piloté par JSON). |

---

**Occurrences restantes assumées** (conformément à la demande : *"s'il reste des occurrences, elles restent pour une raison que vous m'écrivez en une ligne"*) :
- `docs/functional_specifications.md`, `docs/reponses_juridiques.md`, `docs/mails/*.md`, `docs/project_hierarchy.md` : mentionnent "allocations", "droits sociaux", "Permis de Travailler" ou "JibJob" — uniquement pour *décrire les interdictions elles-mêmes* ou tracer les décisions du cabinet. Aucune de ces mentions n'apparaît dans l'interface, l'API ou les données servies aux utilisateurs.

**Restant à faire :** rien côté technique sur les 6 points + bandeau. Tous les éléments demandés par le mail du 07/09 sont en place et vérifiés.
