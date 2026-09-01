# Registre des Activités de Traitement (Data Register)

| Traitement | Finalité | Base Légale | Catégories de Données | Durée de Conservation | Destinataires | Modèle / Table DB |
| - | - | - | - | - | - | - |
| Création Compte | Accès JibJob | Contrat (CGU) | Email, Mot de passe, Date de Naissance | Suppression + 3 ans | Equipe interne | `User` |
| Publication Vidéo | Visibilité | Consentement | URL, Sous-titres, Date consentement, Version texte consentement | Jusqu'à révocation | Public, Recruteurs | `Video` |
| Questionnaire | Permis JEB | Intérêt légitime | Réponses, Score | Durée du compte | Equipe interne | `Profile` (`certificationScore`) |
| Contact Recruteur | Mise en relation | Contrat | Type interaction, Date | Durée du compte | Recruteurs, Candidat | `Interaction` |
| Journal Connexion | Sécurité | Obligation légale | IP, Date (à implémenter) | 1 an | Equipe interne | N/A (à venir) |
