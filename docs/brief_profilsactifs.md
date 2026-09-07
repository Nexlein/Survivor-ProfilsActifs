# PROFILSACTIFS

**< CAHIER DES CHARGES FONCTIONNEL />**

## Informations Générales

- **Ministère du Job et Bonheur, Direction Numérique et Innovation**
- **Référence :** JEB/DNI/2026-003
- **Version :** 1.0, à destination des prestataires techniques sélectionnés
- **Vos interlocuteurs au sein du cabinet ministériel :**
  - Florine Pontaillac, conseillère juridique
  - Thomas Vignal, conseiller numérique
  - Benjamin Sellami, conseiller en communication

## 1. Contexte institutionnel

Dans le cadre de la stratégie numérique du Ministère du Job et Bonheur et en réponse aux nouvelles pratiques de communication professionnelle, **ProfilsActifs** propose une approche innovante de la valorisation des compétences des demandeurs d'emploi.

Partant du constat que les CV traditionnels ne permettent pas toujours aux candidats de se distinguer, ProfilsActifs introduit un format de présentation par vidéo courte, couplé à un système de certification des aptitudes professionnelles. Le dispositif vise à fluidifier la mise en relation entre les chercheurs d'emploi et les recruteurs, en s'appuyant sur des formats de communication adaptés aux usages contemporains.

## 2. Description du service attendu

### 2.1 Périmètre fonctionnel

**Espace demandeur d'emploi :**

- Création d'un profil professionnel (identité, compétences, secteur recherché, localisation)
- Publication de vidéos de présentation (lien externe ou upload selon contraintes techniques)
- Passation du questionnaire de certification professionnelle JEB (obtention d'un badge affiché sur le profil)
- Suivi des interactions reçues (vues, contacts recruteurs)

**Espace recruteur :**

- Accès au catalogue des profils de demandeurs d'emploi
- Filtrage par compétences, secteur, localisation, statut de certification
- Interaction avec les profils (prise de contact, marquage de favoris)
- Tableau de bord de suivi des candidats contactés

**Espace administration :**

- Modération des profils et des contenus vidéo
- Gestion du questionnaire de certification (modification des questions, des pondérations)
- Tableau de bord global (profils actifs, taux de certification, interactions)

### 2.2 Questionnaire de certification professionnelle

Le questionnaire de certification est un élément central du dispositif. Il permet aux demandeurs d'emploi de valoriser leurs aptitudes transversales (communication, organisation, adaptabilité) et de distinguer leur profil par l'obtention d'un badge de certification officiel JEB.

Le questionnaire comprend un nombre significatif de questions, à définir conjointement avec la Direction de la Communication, pour garantir la robustesse et la légitimité de la certification.
Les résultats du questionnaire sont affichés sur le profil du candidat sous forme de score ou de badge.

### 2.3 Exigences fonctionnelles prioritaires

- Le profil doit être consultable publiquement sans compte recruteur (pour maximiser la visibilité des candidats)
- Le badge de certification doit être visuellement distinct et mis en avant sur le profil
- Les vidéos peuvent être intégrées via lien (YouTube, Vimeo) ou upload direct selon les contraintes d'hébergement
- Un système de notification doit informer le candidat lors d'une nouvelle interaction recruteur

## 3. Contraintes techniques

### 3.1 Architecture

- Application web responsive (mobile et desktop)
- Backend avec base de données relationnelle
- API RESTful documentée
- Authentification multi-rôles (demandeur / recruteur / admin)

### 3.2 Vidéo

- L'intégration de vidéos via iframe (YouTube, Vimeo) est acceptée pour la version démonstrateur
- Si un upload direct est implémenté, les fichiers doivent être limités en taille (max 100 Mo par vidéo)
- Un prévisionnement de la vidéo doit être possible sans quitter la page de profil

### 3.3 Identité visuelle

La solution doit respecter les éléments d'identité visuelle du Ministère du Job et Bonheur. Un guide de style sera transmis par la Direction de la Communication. En attendant ce guide, utiliser une palette sobre et professionnelle.

### 3.4 Performance

- Le feed de profils doit être paginé (20 profils par page maximum)
- Le questionnaire de certification doit gérer la sauvegarde en cours de passation (reprise possible en cas d'interruption)

## 4. Livrables attendus

**Semaine 1 : preuve de concept (revue de projet vendredi)**

- Feed de profils consultable (avec au moins 5 profils fictifs intégrés)
- Création de compte demandeur d'emploi avec profil basique et intégration d'une vidéo
- Première version du questionnaire (même partielle)
- Présentation orale : démo fonctionnelle + positionnement du produit

**Semaine 2 : version finale (revue technique jeudi + keynote vendredi)**

- Ensemble des espaces fonctionnels (demandeur, recruteur, admin)
- Questionnaire de certification complet avec affichage du badge
- Système d'interaction du recruteur vers le candidat opérationnel
- Documentation technique
- Rétrospective de projet

## 5. Points d'attention

ProfilsActifs est un outil de valorisation des compétences, pas un réseau social. La dimension d'engagement (likes, partages) n'est pas dans le périmètre de la version démonstrateur. L'objectif est la mise en relation professionnelle, pas la viralité.

*Document émis par la Direction Numérique et Innovation, Ministère du Job et Bonheur. Version soumise à validation avant distribution finale.*
