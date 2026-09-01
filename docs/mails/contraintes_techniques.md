# [JEB/DNI/2026-004] Contraintes techniques & déploiement

**De :** Thomas Vignal <t.vignal@job-et-bonheur.fr>
**Date :** Mar 01/09/2026 10:29

---

## Livrables d'architecture

- **Spécification OpenAPI 3.0**, avec Swagger UI accessible, avant tout déploiement. Elle doit décrire vos trois routes principales **y compris leurs réponses d'erreur** : 400, 401, 403, 404, 422, avec le corps réellement renvoyé.
- **Schéma de base de données** pour vendredi 17h00.
- **.env.example** complet.
- **Endpoint `/health`** qui vérifie réellement la connexion à la base. **503 si la base ne répond pas.**

## Déploiement souverain

- **Aucune dépendance à un service tiers payant ou cloud**. (Pas de AWS, pas de GCP, pas de S3 managé, pas de BDD hébergée).
- L'application doit **tourner intégralement en local**.
- **Une note de déploiement d'une page**.

## Vidéo

- Si upload direct : **100 Mo maximum par fichier**, contrôle appliqué côté serveur, type réel vérifié.
- **Interruption d'upload** : Décidez ce que devient un fichier partiel.
- **Pagination côté serveur obligatoire** sur le feed, 20 profils par page.
- Pas d'autoplay simultané.

## Questionnaire de certification

- **La sauvegarde de progression est une exigence technique**. (Survit au redémarrage serveur).
- Si le contenu du questionnaire change alors qu'un candidat est au milieu, que devient sa progression ? Justifiez.

---

## Summary & DECISION TRACE

**1. Technical Acceptance:**

- We accept OpenAPI/Swagger rules.
- We accept the strict 503 `/health` route.
- We accept 100% local hosting (No AWS/Cloud).
- We accept the 100MB video limit and server-side pagination (20/page).

## DECISION TRACE: Questionnaire Progress (OVERRIDE)

- **Decision:** We accept Thomas Vignal's requirement to save questionnaire progression across sessions.
- **Override Trace:** This explicitly OVERRIDES the Minister's (JEB) handwritten note in the project brief (*"No saving the questionnaire. If you leave, you start over. It tests perseverance"*).
- **Reasoning:** Per supervisor / project hierarchy decision, we chose to listen to the technical expert (Thomas) for system stability and UX over the political mandate. A `QuestionnaireProgress` table has been added to the database.
