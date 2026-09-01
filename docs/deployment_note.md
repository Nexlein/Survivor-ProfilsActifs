# Note de Déploiement

Conformément aux exigences du Ministère (Thomas Vignal - Conseiller Numérique), cette note décrit la stratégie de déploiement souverain de ProfilsActifs.

## 1. Souveraineté & Hébergement

L'application ProfilsActifs est conçue pour fonctionner **intégralement en local** ou sur un serveur privé (on-premise).

- **Aucun service tiers payant** n'est requis.
- **Aucun fournisseur Cloud (AWS, GCP, Azure)** n'est utilisé pour le stockage ou la base de données.
- Le stockage des vidéos (uploads) se fait directement sur le système de fichiers du serveur (dossier `/uploads` persistant).

## 2. Pré-requis

- Un serveur Linux (Debian/Ubuntu).
- **Node.js** (v18 ou supérieur).
- **PostgreSQL** (v14 ou supérieur) installé localement.

## 3. Mise en production (Cas Nominal)

```bash
# 1. Cloner le dépôt
git clone git@github.com:Nexlein/Survivor-ProfilsActifs.git
cd Survivor-ProfilsActifs

# 2. Configurer les variables
cp .env.example .env
# Éditer .env avec les credentials PostgreSQL locaux

# 3. Installer et préparer la BDD
npm ci
npx prisma generate
npx prisma migrate deploy

# 4. Lancer (avec PM2 par exemple)
pm2 start npm --name "profilsactifs-api" -- start
```

## 4. Politique d'Upload Interrompu

Les uploads vidéos sont limités à 100 Mo.
**Gestion des interruptions :**
Lorsqu'un upload est interrompu, le fichier partiel est conservé temporairement sur le disque. Une tâche planifiée (cron job) s'exécute chaque nuit à 03h00 pour supprimer les fichiers orphelins (fichiers non validés en base de données de plus de 24 heures). Cela garantit l'intégrité du système de fichiers sans bloquer les requêtes.
