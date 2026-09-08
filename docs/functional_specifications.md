# DEFINITIVE FUNCTIONAL SPECIFICATIONS - PROFILSACTIFS

*(Document consolidé incluant le brief initial et toutes les directives contraignantes de la DNI, Juridique et Communication. Ce document sert également de liste de suivi de projet).*

## 1. Identité et Positionnement

- [x] **Nom du projet** : ProfilsActifs (le nom JibJob est formellement interdit).
  - *Fait* : Vérification effectuée. "JibJob" n'est conservé que dans l'historique des mails de refus, et le document `project_hierarchy.md` a été entièrement réécrit pour refléter le bannissement du nom.
- [x] **Objectif** : Mise en relation professionnelle par vidéo courte. Ce n'est pas un réseau social.
- [x] **Charte Graphique** : Typographie Marianne/Spectral. Couleurs `#1B3A6B` et `#FF9900`.
- [x] **Vocabulaire et Sémantique (URGENT - Matignon)** :
  - Les termes `tendances`, `populaire`, `viral` sont strictement interdits. On parle de `profils mis en avant`.
  - L'expression `Permis de travailler` est strictement interdite. Utiliser `Badge de certification`. Le badge valorise mais n'autorise aucun droit.
  - **Toute mention liant l'application aux allocations ou droits sociaux est strictement interdite** (interfaces, variables, DB, migrations).
  - *À faire* : Grep complet du dépôt et nettoyage absolu. Fournir le log brut.

## 2. Espace Demandeur d'Emploi

- [ ] **Bandeau d'Avertissement Légal** :
  - Un bandeau permanent doit figurer en haut de TOUTES les pages de l'espace candidat (y compris connexion et erreur).
  - Texte exact imposé : *"Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations."*
- [x] **Création de profil** : Identité, compétences, secteur, localisation.
- [x] **Protection des Mineurs (RGPD)** : Saisie obligatoire de la date de naissance. Blocage strict des < 16 ans. Les 16-18 ans sont masqués publiquement (visibles uniquement des recruteurs).
- **Vidéos** :
  - [x] Upload direct limité à 100 Mo max par serveur.
  - [x] **Consentement loggé** : Date, heure, version du texte.
  - [x] **Droit à l'oubli** : Révocation = suppression physique et définitive du `.mp4`.
  - [ ] **Sous-titres** : L'interface doit pouvoir afficher une vraie piste de sous-titres (accessibilité).
- **Certification (Questionnaire)** :
  - [ ] **Réduction à 20 questions** (au lieu de 100).
    - *À faire* : Modifier le JSON pour ne garder que 20 questions. Fournir une justification de 5 lignes sur le choix des 20 questions conservées.
  - [x] **Non-bloquant** : Le passage de la certification n'est plus obligatoire pour qu'un profil soit visible par les recruteurs.
  - [ ] **Gestion des passations existantes** : Les réponses aux 80 questions supprimées rendent les anciens scores obsolètes.
    - *À faire* : Créer un script (rejouable) pour invalider ou recalculer les scores existants et marquer les badges. Fournir des statistiques avant/après.
  - [x] **Mise en avant** : Le badge de certification doit être visuellement distinct sur le profil public.

## 3. Flux Public et Espace Recruteur

- [x] **Feed et UI (Fin de l'effet TikTok)** :
  - Le feed vertical plein écran en autoplay disparaît.
  - Retour à une **grille de profils** classique paginée (20 max), avec lecture vidéo uniquement sur clic.
  - *À faire* : Rediriger (301) les anciennes URL du feed plein écran vers la nouvelle grille.
- [x] **Catalogue et Filtres** : Justification professionnelle obligatoire (non-discrimination).
- [x] **Compteurs d'engagement** : Strictement interdits d'affichage public ou API (Likes/Vues). Gardés uniquement en base.

## 4. Espace Administration (DNI)

- [x] **Modération Vidéo (A Priori)** : Statut `PENDING`, inaccessible par URL directe. Motif de rejet obligatoire.
- [ ] **Modération des profils** : Masquage manuel d'un profil abusif.
- [ ] **Questionnaire UI** : Fichier JSON strict (fait). **Suppression de l'UI d'administration**.

## 5. Contraintes Techniques Obligatoires

- [x] **Hébergement** : 100% Local. Zéro Cloud.
- [x] **API & Swagger** : API RESTful documentée via OpenAPI 3.0.
- [x] **Bootloader Zod** : Crash serveur si le JSON du questionnaire est invalide.
- [x] **Healthcheck** : Route `/health` renvoyant 503 si la BDD est injoignable.
- [x] **Accessibilité** : RGAA niveau AA (navigation clavier, contrastes) sur 3 écrans.

## 6. Livrables Attendus (Mardi 12h00 pour le code, Mercredi 12h00 pour la data)

- [ ] Journal des modifications (Changelog ligne par ligne avec instruction correspondante).
- [ ] Rapport brut (grep) de l'éradication des mentions "Droits Sociaux/Allocations".
- [ ] Script de migration des badges avec statistiques avant/après.
- [ ] Fiche de registre de traitement de données, Projet de CGU, Note filtres, Accessibilité.

## 7. Retours Juridiques (Florine Pontaillac)

- [x] **Registre de Traitement** :
  - Ajouter le DPO et les Responsables de traitement.
  - Définir les durées de conservation des données.
  - Minimiser les données stockées et leur durée de conservation (RGPD).
- [x] **Conditions Générales d'Utilisation (CGU)** :
  - Corriger la contradiction de l'Article 2 (âge : contrôle vs non obligatoire).
  - Vulgariser le document (exclure le jargon technique comme "bcrypt").
  - Adoucir les tournures de phrases pour le grand public.
