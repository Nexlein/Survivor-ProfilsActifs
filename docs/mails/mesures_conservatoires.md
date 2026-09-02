# [Juridique] ProfilsActifs : mesures conservatoires demandées avant toute démonstration

**De :** Florine Pontaillac <f.pontaillac@job-et-bonheur.fr>
**Date :** Mer 02/09/2026 15:59

---

Bonjour,

Florine Pontaillac. Je reviens vers vous plus tôt que je ne l'avais annoncé. J'ai eu cet après-midi un échange téléphonique avec le service juridique de FranceTravail, et il en ressort trois points sur lesquels je ne peux pas rester silencieuse.

Je vous demande donc de mettre en œuvre les mesures suivantes **avant toute démonstration publique du dispositif**, y compris celle de demain.

1. **Vérification de l'âge à l'inscription.** Une date de naissance déclarative, avec blocage strict en dessous de 16 ans, et un parcours distinct pour les 16 à 18 ans : mention d'information adaptée, pas de vidéo publique par défaut. Je vous avais signalé le sujet hier, il devient prioritaire. Deux conséquences qu'il conviendrait de traiter en même temps, sans quoi la mesure ne vaut rien : les **comptes déjà créés** sans date de naissance, y compris ceux de vos jeux de démonstration, et l'exclusion des profils de mineurs du catalogue consultable **sans compte recruteur**. Un blocage à l'inscription qui laisse passer les profils déjà en base ne protège personne.

2. **Modération a priori des contenus vidéo.** Toute vidéo déposée doit passer par un état « en attente de validation » avant d'être visible par un recruteur ou par le public. La modération a posteriori ne me paraît pas tenable sur un service public : nous serions responsables du contenu dès sa mise en ligne, et je ne vois pas qui, au cabinet, assumerait cette responsabilité. Concrètement, il me faudrait :
   - un **écran d'administration** permettant de valider ou de refuser, avec un **motif enregistré** et une trace de qui a décidé et quand ;
   - le motif de refus **porté à la connaissance du candidat** dans son espace. Une vidéo qui disparaît sans explication est un contentieux qui commence ;
   - le basculement des **vidéos déjà déposées** en état d'attente. Celles qui ont déjà été consultées par un recruteur, dites-moi ce que vous en faites : les retirer, les laisser, les signaler. Je ne vous impose pas la réponse, je vous demande de l'avoir choisie ;
   - et le point sur lequel je serai la plus attentive : une vidéo en attente ne doit être accessible **par aucun moyen**, pas seulement invisible dans l'interface. Ouvrez son adresse directe dans une fenêtre de navigation privée et joignez-moi la capture de ce que vous obtenez. Si la vidéo se lit, la mesure n'existe pas.

3. **Retrait de l'affichage public des compteurs d'engagement.** Le nombre de mentions « j'aime » ne doit plus apparaître sur la fiche publique d'un candidat. Vous pouvez le conserver en base et l'afficher au candidat lui-même dans son espace privé. Mais un compteur public constitue, selon l'analyse que je fais du dossier, un **classement de personnes fondé sur la popularité**. Sur un service de l'emploi, cela m'expose à une difficulté que je ne saurais assumer. Le retrait s'entend de l'affichage *et* de ce que votre serveur renvoie : réponses d'API, exports, vues recruteur, aperçus partagés. Une donnée retirée de la page mais présente dans la réponse reste une donnée publiée.

Le point 3 ne remet pas en cause la fonctionnalité elle-même, il porte sur son **affichage**. Si l'on me démontre par écrit que le compteur public poursuit une finalité professionnelle légitime, je réexaminerai ma position. Par écrit, j'y tiens.

Je mesure l'effet d'un message pareil à 15h40 un mercredi. Aussi, pour que vous puissiez organiser votre soirée : je considère comme **bloquants pour la démonstration de demain** le blocage des moins de 16 ans et l'état d'attente des vidéos. Le reste, y compris le traitement des comptes existants et le retrait complet des compteurs côté serveur, peut m'être remis **vendredi 12h00** avec le reste du dossier.

Je préfère néanmoins vous exposer une contrainte tôt qu'un refus d'avis tard.

Bien cordialement,
Florine Pontaillac - Conseillère juridique
Cabinet du Ministre - Ministère du Job et Bonheur

---

## Summary of Action Items & Legal Requirements

**Deadline:** Blocking for tomorrow's demo (Age and Video Moderation). The rest (existing accounts, complete counter hiding) is due Friday 12h00.

**1. Code / Database Changes Required:**

- **Age Verification & Catalog Filtering**:
  - Block registration for under 16 (Already done).
  - Hide profiles of minors (<18) from the public catalog unless the viewer is authenticated as a Recruiter.
  - Implement a migration or fallback strategy for existing accounts (from demo seeding) that lack a Date of Birth.
- **A Priori Video Moderation**:
  - Introduce a `status` (PENDING, APPROVED, REJECTED) to the `Video` model.
  - Create an **Admin Moderation Dashboard API** to review, approve, or reject videos with recorded reasons and traceability (who, when).
  - Present the rejection reason to the candidate in their private space.
  - **Critical Security**: PENDING videos must be completely inaccessible via direct URL (requires moving away from static `express.static` file serving to an authenticated streaming controller).
- **Public Engagement Counters**:
  - Remove all public exposure of `likes` and `views` (API responses, exports, recruiter views).
  - Keep the counters in the DB for the candidate's private dashboard ONLY.

---

## DECISION TRACE: A Priori Moderation & Engagement Counters (OVERRIDE)

- **Decision:** We accept Florine Pontaillac's strict constraints for A Priori Moderation and the complete public masking of engagement counters (Likes/Views).
- **Override Trace:** This explicitly OVERRIDES the Minister's (JEB) original "TikTok for Jobs" vision outlined in the brief, which relied on instant video publishing and public popularity metrics to drive viral engagement.
- **Reasoning:** Per project hierarchy, Legal dictates outrank Product features. A public employment service cannot be legally responsible for unmoderated instant uploads, nor can it operate a public ranking of citizens based on popularity without risking severe discrimination lawsuits.
