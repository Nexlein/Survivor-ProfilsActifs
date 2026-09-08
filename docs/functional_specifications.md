# DEFINITIVE FUNCTIONAL SPECIFICATIONS - PROFILSACTIFS

*(Document consolidé incluant le brief initial et toutes les directives contraignantes de la DNI, Juridique et Communication. Ce document sert également de liste de suivi de projet).*

## 1. Identité et Positionnement

- [x] **Nom du projet** : ProfilsActifs (le nom JibJob est formellement interdit).
  - *Fait* : Vérification effectuée. "JibJob" n'est conservé que dans l'historique des mails de refus, et le document `project_hierarchy.md` a été entièrement réécrit pour refléter le bannissement du nom.
- [x] **Objectif** : Mise en relation professionnelle par vidéo courte. Ce n'est pas un réseau social.
- [x] **Charte Graphique** : Typographie Marianne/Spectral. Couleurs `#1B3A6B` et `#FF9900`.
- [x] **Vocabulaire et Sémantique (URGENT - Matignon)** :
  - Les termes `tendances`, `populaire`, `viral` sont strictement interdits. On parle de `profils mis en avant`.
  - [x] L'expression `Permis de travailler` est strictement interdite. Utiliser `Badge de certification`. Le badge valorise mais n'autorise aucun droit.
    - *Fait (07/09)* : dernières occurrences trouvées dans `certification/questions.v1.json` (2 questions du quiz) corrigées. Le champ API est déjà `hasCertificationBadge` partout (front + back).
  - [x] **Toute mention liant l'application aux allocations ou droits sociaux est strictement interdite** (interfaces, variables, DB, migrations).
    - *Fait (07/09)* : grep complet du dépôt (interface, CGU, commentaires, migrations, tests, i18n, doc API, données de démo) — zéro occurrence. Log brut joint à Benjamin.

## 2. Espace Demandeur d'Emploi

- [x] **Bandeau d'Avertissement Légal** :
  - Un bandeau permanent doit figurer en haut de TOUTES les pages de l'espace candidat (y compris connexion et erreur).
  - Texte exact imposé : *"Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations."*
  - *Fait (08/09)* : `frontend/src/components/layout/LegalBanner.tsx`, rendu au-dessus du `Header` dans `layout.tsx` (donc sur toutes les pages, y compris erreur/404 qui héritent du layout racine). Affiché pour visiteur anonyme ou `JOB_SEEKER`, masqué pour `RECRUITER`/`ADMIN`. Texte exact, non fermable. Vérifié visuellement sur accueil, connexion et 404.
- [x] **Création de profil** : Identité, compétences, secteur, localisation.
- [x] **Protection des Mineurs (RGPD)** : Saisie obligatoire de la date de naissance. Blocage strict des < 16 ans. Les 16-18 ans sont masqués publiquement (visibles uniquement des recruteurs).
- **Vidéos** :
  - [x] Upload direct limité à 100 Mo max par serveur.
  - [x] **Consentement loggé** : Date, heure, version du texte.
  - [x] **Droit à l'oubli** : Révocation = suppression physique et définitive du `.mp4`.
  - [ ] **Sous-titres** : L'interface doit pouvoir afficher une vraie piste de sous-titres (accessibilité).
- **Certification (Questionnaire)** :
  - [x] **Réduction à 20 questions** (au lieu de 100).
    - *Fait (07/09)* : `certification/questions.v1.json` passé en version 2, 20 questions retenues (2 par dimension), pondération ajustée pour rester sur 1000 points / seuil 700 inchangé. Justification et liste complète dans `docs/reponses_juridiques.md` §5.
  - [x] **Non-bloquant** : Le passage de la certification n'est plus obligatoire pour qu'un profil soit visible par les recruteurs.
  - [x] **Gestion des passations existantes** : Les réponses aux 80 questions supprimées rendent les anciens scores obsolètes.
    - *Fait (07/09)* : script rejouable `backend/scripts/migrate_questionnaire_v2.ts` (`npm run migrate:questionnaire`), idempotent, invalide les `QuestionnaireResult` d'une version obsolète (recalcul vérifié impossible — les réponses détaillées ne sont pas conservées après soumission) et nettoie les passations en cours obsolètes. Testé sur les données de démo : 1 résultat invalidé, stats avant/après affichées par le script.
  - [x] **Mise en avant** : Le badge de certification doit être visuellement distinct sur le profil public.

## 3. Flux Public et Espace Recruteur

- [x] **Feed et UI (Fin de l'effet TikTok)** :
  - Le feed vertical plein écran en autoplay disparaît.
  - Retour à une **grille de profils** classique paginée (20 max), avec lecture vidéo uniquement sur clic.
  - *Vérifié (07/09)* : recherche dans tout l'historique git — aucune route de feed plein écran n'a jamais existé dans ce dépôt. Rien à rediriger.
- [x] **Catalogue et Filtres** : Justification professionnelle obligatoire (non-discrimination).
- [x] **Compteurs d'engagement** : Strictement interdits d'affichage public ou API (Likes/Vues). Gardés uniquement en base.

## 4. Espace Administration (DNI)

- [x] **Modération Vidéo (A Priori)** : Statut `PENDING`, inaccessible par URL directe. Motif de rejet obligatoire.
- [ ] **Modération des profils** : Masquage manuel d'un profil abusif.
- [x] **Questionnaire UI** : Fichier JSON strict (fait). **Suppression de l'UI d'administration**.
  - *Fait (08/09)* : `frontend/src/app/admin/questionnaire/` supprimé (page 100% factice — données `DEMO_QUESTIONS` en dur, aucune route CRUD n'existait côté backend, la page l'indiquait elle-même). Lien de nav "Questionnaire" retiré du menu admin (`Header.tsx`). Vérifié côté backend : aucun modèle `Question`/`Option` ni route CRUD (déjà supprimés lors du passage au questionnaire piloté par JSON) — rien à faire côté serveur.

## 5. Contraintes Techniques Obligatoires

- [x] **Hébergement** : 100% Local. Zéro Cloud.
- [x] **API & Swagger** : API RESTful documentée via OpenAPI 3.0.
- [x] **Bootloader Zod** : Crash serveur si le JSON du questionnaire est invalide.
- [x] **Healthcheck** : Route `/health` renvoyant 503 si la BDD est injoignable.
- [x] **Accessibilité** : RGAA niveau AA (navigation clavier, contrastes) sur 3 écrans.

## 6. Livrables Attendus (Mardi 12h00 pour le code, Mercredi 12h00 pour la data)

- [x] Journal des modifications (Changelog ligne par ligne avec instruction correspondante).
- [x] Rapport brut (grep) de l'éradication des mentions "Droits Sociaux/Allocations".
- [x] Script de migration des badges avec statistiques avant/après.
- [x] Fiche de registre de traitement de données, Projet de CGU, Note filtres, Accessibilité.

## 7. Retours Juridiques (Florine Pontaillac)

- [x] **Registre de Traitement** :
  - Ajouter le DPO et les Responsables de traitement.
  - Définir les durées de conservation des données.
  - Minimiser les données stockées et leur durée de conservation (RGPD).
- [x] **Conditions Générales d'Utilisation (CGU)** :
  - Corriger la contradiction de l'Article 2 (âge : contrôle vs non obligatoire).
  - Vulgariser le document (exclure le jargon technique comme "bcrypt").
  - Adoucir les tournures de phrases pour le grand public.

## 8. Retours Tech Lead (Thomas Vignal - Tri et Charge)

- [x] Tri déterministe du catalogue (`updatedAt` DESC, `id` ASC).
- [x] Preuve algorithmique du tri (script et rapport de stabilité).
- [x] Note descriptive de l'algorithme de classement et des filtres (limites incluses).
- [x] Script de peuplement (Load test) : 500 profils, 300 vidéos via `VideoProvider`.
- [x] Tests de charge : 100 utilisateurs simultanés sur le catalogue (`autocannon`).
- [x] Rapport de performance (médiane, p95, goulot d'étranglement, avant/après index).
