# Registre des Activités de Traitement (Data Register)

| Traitement | Finalité | Base Légale | Catégories de Données | Durée de Conservation | Destinataires | Modèle / Table DB |
| - | - | - | - | - | - | - |
| Création Compte | Accès ProfilsActifs | Contrat (CGU) | Email, Mot de passe, Date de Naissance | Suppression + 3 ans | Equipe interne | `User` |
| Profil Professionnel Candidat | Cible des offres | Contrat (CGU) | Secteur recherché, Localisation, Compétences | Durée du compte | Public, Recruteurs | `Profile` |
| Profil Professionnel Recruteur | Transparence | Contrat (CGU) | Entreprise, Secteur, Poste | Durée du compte | Candidats | `Profile` |
| Publication Vidéo | Visibilité | Consentement | URL, Sous-titres, Date consentement, Version texte consentement | Jusqu'à révocation | Public, Recruteurs | `Video` |
| Sauvegarde Questionnaire | Confort utilisateur | Intérêt légitime | Réponses partielles | Durée du compte | Equipe interne | `QuestionnaireProgress` |
| Questionnaire | Permis JEB | Intérêt légitime | Score Final | Durée du compte | Equipe interne | `Profile` (`certificationScore`) |
| Interactions (Vues/Likes/Contact) | Suivi & Avantages | Contrat | Type interaction, IP, Date | Durée du compte | Recruteurs, Candidat, Admin | `Interaction` |
| Journal Connexion | Sécurité | Obligation légale | IP, Date | 1 an | Equipe interne | `LoginLog` |

## Droits des Personnes (RGPD)

Conformément au cadre juridique, ProfilsActifs automatise le traitement des droits suivants via l'API :

1. **Droit d'Accès et Portabilité (`GET /compliance/data-export`)** : L'utilisateur peut récupérer instantanément et intégralement l'ensemble de ses données (Profil, Vidéos, Interactions, Logs, Questionnaire) sous format JSON lisible.
2. **Droit à l'Oubli et Révocation de Consentement (`DELETE /compliance/account`)** : Le compte est détruit. La suppression des fichiers médias (Vidéos `.mp4` et Sous-titres `.vtt`) est effectuée **physiquement sur le disque du serveur** via commande système (`fs.unlinkSync`), garantissant qu'aucune donnée ne survit à un `soft-delete`. La base de données supprime ensuite le reste en cascade.
