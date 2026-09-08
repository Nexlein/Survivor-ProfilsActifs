# Parcours Utilisateur (User Journeys)

Les schémas ci-dessous décrivent les parcours types des trois rôles principaux de la plateforme ProfilsActifs, en accord avec les spécifications fonctionnelles actuelles.

## 1. Parcours Candidat (Recherche d'emploi)

```mermaid
flowchart TD
    A[Accueil] --> B[Création de compte Candidat]
    B --> C[Remplissage du profil de base]
    C --> D{Choix du candidat}
    D -->|Compléter profil| E[Upload Vidéo de présentation]
    D -->|Se certifier| F[Passage du questionnaire de certification]
    F --> G{Score > 70% ?}
    G -->|Oui| H[Obtention du Badge 'Candidat Certifié']
    G -->|Non| I[Retour au profil - Retry ultérieur]
    E --> J[Validation par la modération]
    J -->|Approuvé| K[Mise en avant sur la plateforme]
    J -->|Rejeté| L[Notification de refus avec motif]
    H --> K
```

## 2. Parcours Recruteur

```mermaid
flowchart TD
    A[Accueil] --> B[Connexion compte Recruteur]
    B --> C[Accès au Catalogue Public]
    C --> D[Consultation paginée déterministe]
    D --> E{Actions de recherche}
    E --> F[Appliquer des filtres métier]
    E --> G[Filtrer par 'Candidat Certifié']
    F --> H[Accès à la fiche détaillée du candidat]
    G --> H
    H --> I[Visionnage de la vidéo de présentation]
    I --> J[Prise de contact en externe]
```

## 3. Parcours Administrateur (Modération)

```mermaid
flowchart TD
    A[Connexion Admin] --> B[Tableau de bord]
    B --> C[Vue des KPIs globaux]
    B --> D[File d'attente de modération des vidéos]
    D --> E{Évaluation de la vidéo}
    E -->|Conforme| F[Approbation]
    E -->|Abusif / Hors-sujet| G[Rejet avec motif]
    B --> H[Modération des profils]
    H --> I[Masquage manuel des profils abusifs]
```
