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
