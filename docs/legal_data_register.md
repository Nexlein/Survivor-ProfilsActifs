# Registre des Activités de Traitement (Data Register)

| Traitement | Finalité | Base Légale | Catégories de Données | Durée de Conservation | Destinataires | Modèle / Table DB |
| - | - | - | - | - | - | - |
| Création Compte | Accès ProfilsActifs | Contrat (CGU) | Email, Mot de passe, Date de Naissance | Suppression + 3 ans | Equipe interne | `User` |
| Publication Vidéo | Visibilité | Consentement | URL, Sous-titres, Date consentement, Version texte consentement | Jusqu'à révocation | Public, Recruteurs | `Video` |
| Sauvegarde Questionnaire | Confort utilisateur | Intérêt légitime | Réponses partielles | Durée du compte | Equipe interne | `QuestionnaireProgress` |
| Questionnaire | Permis JEB | Intérêt légitime | Score Final | Durée du compte | Equipe interne | `Profile` (`certificationScore`) |
| Interactions (Vues/Likes/Contact) | Suivi & Avantages | Contrat | Type interaction, IP, Date | Durée du compte | Recruteurs, Candidat, Admin | `Interaction` |
| Journal Connexion | Sécurité | Obligation légale | IP, Date | 1 an | Equipe interne | `LoginLog` |
