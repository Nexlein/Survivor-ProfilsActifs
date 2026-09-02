# Répertoire des Routes API (ProfilsActifs)

Ce document répertorie l'ensemble des routes API du projet ProfilsActifs, avec leur statut actuel (Fait / A faire), leur niveau d'accès et leur description.

> **Note d'Architecture** : Ce document a été mis à jour pour intégrer strictement les audits juridiques (RGPD, Révocation), techniques (Limites, Serveur, RGAA) et de communication (Vocabulaire institutionnel obligatoire).

---

## Vue d'ensemble du statut

| Module | Statut |
| :--- | :--- |
| **Système / Santé (`/health`)** | 100% Terminé |
| **Authentification (`/auth`)** | 100% Terminé (Register, Login, Get Current User, Logout, Refresh) |
| **Gestion des Profils (`/profile`)** | 100% Terminé |
| **Vidéos & Feed (`/videos`)** | A faire |
| **Questionnaire & Certification JEB (`/questionnaire`)** | A faire |
| **Interactions Recruteur (`/interactions`)** | A faire |
| **Compétences / Skills (`/skills`)** | A faire |
| **Conformité & RGPD (`/compliance`)** | 100% Terminé |

---

## 1. Système & Santé (`/health`)

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Vérification de la santé du serveur avec un VRAI ping PostgreSQL (ex: `SELECT 1`). Retourne HTTP 503 si DB down. | Fait |

---

## 2. Authentification (`/auth`)

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Inscription d'un utilisateur (Candidat / Recruteur) avec vérification d'âge (16+). | Fait |
| `POST` | `/auth/login` | Public | Connexion utilisateur et génération du token JWT. | Fait |
| `GET` | `/auth/get-current-user` | Privé | Récupération de l'utilisateur actuellement connecté. | Fait |
| `POST` | `/auth/logout` | Privé | Déconnexion de l'utilisateur. | Fait |
| `POST` | `/auth/refresh` | Public | Rafraîchissement du token JWT d'accès. | Fait |

---

## 3. Profils (`/profile`)

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Privé | Récupération du profil de l'utilisateur connecté. | Fait |
| `PUT` | `/profile` | Privé | Mise à jour des informations du profil (nom, secteur cible, localisation). | Fait |
| `DELETE` | `/profile` | Privé | Suppression du profil de l'utilisateur connecté. | Fait |
| `GET` | `/profile/me` | Privé | Consultation détaillée du profil de l'utilisateur actif. | Fait |
| `GET` | `/profile/all` | Privé | Catalogue Recruteur : Liste complète filtrable. **Filtres stricts (RGPD) : `?skills`, `?targetSector`, `?location`. Aucun autre filtre autorisé.** | À Mettre à jour (Filtres manquants) |
| `GET` | `/profile/user/:id` | Privé | Récupération du profil correspondant à l'ID utilisateur spécifié. | Fait |

---

## 4. Vidéos & Feed (`/videos`)

> **Contraintes techniques** : Limite stricte de 100 Mo par fichier. Le serveur doit écraser toute tentative de pagination > 20. L'upload acceptera du `multipart/form-data` pour recevoir 2 fichiers : la vidéo (.mp4) et les sous-titres obligatoires RGAA (.vtt). Nettoyage des fichiers orphelins en cas d'échec.

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/videos/feed` | Public / Privé | Feed vidéo paginé (20 profils par page `?page=1&limit=20` max). | A faire |
| `POST` | `/videos/upload` | Privé (Candidat) | Upload vidéo CV + sous-titres (max 100Mo, enregistrement consentement RGPD). | A faire |
| `GET` | `/videos/:id` | Public / Privé | Récupération des métadonnées d'une vidéo et streaming. | A faire |
| `GET` | `/videos/:id/subtitles` | Public / Privé | Serveur du fichier de sous-titre (.vtt) pour le lecteur vidéo (Accessibilité RGAA). | A faire |
| `DELETE` | `/videos/:id` | Privé (Propriétaire) | Révocation Consentement : **Suppression physique** (`fs.unlinkSync`) du disque et de la BDD. | A faire |
| `POST` | `/videos/:id/like` | Privé | Ajouter un "Like" sur une vidéo. | A faire |
| `POST` | `/videos/:id/view` | Public / Privé | Enregistrer une vue sur une vidéo. | A faire |

---

## 5. Questionnaire de Certification JEB (`/questionnaire`)

> **Contraintes techniques (Thomas Vignal)** : Sauvegarde persistante de l'avancement en base de données pour résister aux redémarrages.

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/questionnaire/questions` | Privé (Candidat) | Récupération de la liste des questions et options du questionnaire. | A faire |
| `GET` | `/questionnaire/progress` | Privé (Candidat) | Récupération de la progression sauvegardée du candidat. | A faire |
| `POST` | `/questionnaire/progress` | Privé (Candidat) | Sauvegarde intermédiaire de l'avancement du questionnaire. | A faire |
| `POST` | `/questionnaire/submit` | Privé (Candidat) | Soumission finale, calcul du score de certification et attribution du permis de travail (`hasWorkPermit`). | A faire |

---

## 6. Interactions Recruteurs (`/interactions`)

> **Usage** : Permet aux recruteurs de sauvegarder leurs profils favoris, contacter les candidats ou marquer des profils comme vus.

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/interactions` | Privé (Recruteur) | Création d'une interaction (`VIEW`, `CONTACT`, `FAVORITE`, `LIKE`). | A faire |
| `GET` | `/interactions/recruiter` | Privé (Recruteur) | Historique des interactions effectuées par le recruteur connecté. | A faire |
| `GET` | `/interactions/profile/:profileId` | Privé | Liste des interactions reçues par un profil candidat. | A faire |
| `DELETE` | `/interactions/:id` | Privé (Recruteur) | Retirer une interaction (ex: retirer des favoris). | A faire |

---

## 7. Compétences / Skills (`/skills`)

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/skills` | Public / Privé | Récupération de la liste globale des compétences disponibles. | A faire |
| `POST` | `/skills` | Privé (Admin) | Ajout d'une nouvelle compétence dans le référentiel. | A faire |
| `POST` | `/profile/skills` | Privé (Candidat) | Association de compétences au profil utilisateur. | A faire |
| `DELETE` | `/profile/skills/:skillId` | Privé (Candidat) | Retrait d'une compétence du profil utilisateur. | A faire |

---

## 8. Conformité & RGPD (`/compliance`)

| Méthode | Route | Accès | Description | Statut |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/compliance/data-export` | Privé | Exportation complète des données personnelles (Droit d'accès RGPD). | Fait |
| `DELETE` | `/compliance/account` | Privé | Suppression intégrale du compte et des vidéos (Droit à l'oubli). | Fait |

---

## Règles d'implémentation (Rappel Architecture)

Lors de l'implémentation de chaque nouvelle route :

1. **Contrôleur isolé** : Créer le contrôleur dans `src/controllers/`. Pas de logique métier dans les fichiers de route.
2. **Prisma Singleton** : Importer systématiquement `prisma` via `import prisma from '../prisma'`.
3. **Swagger / OpenAPI** : Documenter la route dans `swagger.yaml` immédiatement avec ses codes d'erreur (`200`, `400`, `401`, `403`, `404`, `422`, etc.).
