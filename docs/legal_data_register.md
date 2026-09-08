# Registre des Activités de Traitement (Data Register)

**Responsable de traitement :** Ministère du Job et Bonheur (Cabinet du Ministre).
**Délégué à la Protection des Données (DPO) :** <dpo@job-et-bonheur.fr> (Service juridique du Ministère).

## Tableau des Traitements

Afin de respecter le principe de minimisation des données (RGPD), les durées de conservation sont strictement limitées à la réalisation de la finalité.

| Traitement | Finalité | Base Légale | Catégories de Données | Durée de Conservation | Destinataires | Modèle DB |
| - | - | - | - | - | - | - |
| Création Compte | Accès ProfilsActifs | Contrat (CGU) | Email, Mot de passe, Date de Naissance | Fin du compte (ou 2 ans d'inactivité) | Interne | `User` |
| Profil Candidat | Cible des offres | Contrat (CGU) | Secteur, Localisation, Compétences | Fin du compte (ou 2 ans d'inactivité) | Public, Recruteurs | `Profile` |
| Profil Recruteur | Transparence | Contrat (CGU) | Entreprise, Secteur, Poste | Fin du compte (ou 2 ans d'inactivité) | Candidats | `Profile` |
| Publication Vidéo | Visibilité | Consentement | Vidéo, Sous-titres, Date consentement | Révocation, ou fin du compte | Public, Recruteurs | `Video` |
| Sauvegarde Questionnaire | Confort utilisateur | Intérêt légitime | Réponses partielles | 7 jours maximum (purge automatique) | Interne | `QuestionnaireProgress` |
| Questionnaire | Badge certification | Intérêt légitime | Score Final, Version du test | Fin du compte | Interne | `QuestionnaireResult` |
| Interactions | Suivi professionnel | Contrat | Type interaction, IP, Date | 6 mois maximum | Recruteurs, Candidat | `Interaction` |
| Journal Connexion | Sécurité | Obligation légale | IP, Date | 1 an légal maximum | Interne, Autorités | `LoginLog` |

## Droits des Personnes (RGPD)

Conformément au cadre juridique, ProfilsActifs automatise le traitement des droits suivants via l'API :

1. **Droit d'Accès et Portabilité (`GET /compliance/data-export`)** : L'utilisateur peut récupérer instantanément et intégralement l'ensemble de ses données sous format JSON lisible.
2. **Droit à l'Oubli et Révocation de Consentement (`DELETE /compliance/account`)** : Le compte est détruit. La suppression des fichiers médias (Vidéos `.mp4` et Sous-titres `.vtt`) est effectuée **physiquement sur le disque du serveur** garantissant qu'aucune donnée ne survit à un `soft-delete`. La base de données supprime ensuite le reste en cascade.
