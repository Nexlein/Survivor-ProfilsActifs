# [JEB/DNI/2026-003] Exigences juridiques applicables au dispositif ProfilsActifs

**De :** Florine Pontaillac <f.pontaillac@job-et-bonheur.fr>
**Date :** Mar 01/09/2026 10:00

---

Bonjour,

Florine Pontaillac, conseillère juridique au cabinet du Ministre. Je prends l'attache de votre équipe dès ce matin car, de tous les projets engagés par le Ministère, **ProfilsActifs** est celui qui appelle de ma part le plus de réserves. Autant vous le dire maintenant plutôt qu'au moment de la livraison.

1. **Données vidéos.** Une vidéo de présentation contient l'image et la voix d'une personne physique identifiable. Elle appelle un consentement **écrit, spécifique et révocable**. Il conviendrait donc que le consentement soit **enregistré** et non simplement coché : date, heure, et version du texte accepté, conservées avec le profil. Et la révocation doit produire un effet réel, c'est-à-dire la **suppression du fichier**, pas le masquage de la fiche. Je vous demanderai de me le démontrer : sur un compte d'essai, une vue de votre répertoire de stockage avant révocation, la même après, et la fiche du profil entre les deux.

2. **Non-discrimination.** L'article L1132-1 du code du travail prohibe toute sélection fondée sur l'apparence physique, l'âge, l'origine ou le sexe. Or un dispositif de mise en relation qui repose sur la vidéo expose structurellement à ce risque, et je n'ai rien trouvé dans le cahier des charges qui vienne l'encadrer. Je vous demande donc la liste des **critères de filtrage effectivement exposés par votre interface et par votre API**, un par un, chacun assorti de sa justification professionnelle en une phrase. Un critère que vous ne savez pas justifier en une phrase est un critère qu'il conviendrait de retirer, et je préférerais lire dans votre note ceux que vous avez retirés.

3. **Mineurs.** Les demandeurs d'emploi de 16 à 18 ans relèvent d'un régime spécifique. Une **vérification de l'âge** à l'inscription me paraît indispensable. Dites-moi également, en deux lignes, ce que vous faites des comptes déjà créés sans date de naissance, y compris ceux de vos jeux de démonstration.

4. **Accessibilité.** RGAA niveau AA. Je ne vous demande pas un audit des 106 critères, je vous demande trois écrans nommés et réellement vérifiés : le parcours d'inscription, la fiche profil publique, le catalogue recruteur. Navigation complète au clavier, focus visible en permanence, et les **rapports de contraste mesurés** pour chaque couple texte / fond que vous utilisez. Une déclaration d'accessibilité qui annonce une conformité que la vérification ne soutient pas m'expose personnellement : je préfère de loin une déclaration partielle et exacte.

5. **Sous-titres.** Ils sont une obligation d'accessibilité, pas une option de confort. Au moins une vidéo de votre jeu de démonstration doit porter une **piste de sous-titres réelle, affichée par votre lecteur**. Je regarderai celle-là.

6. **CGU.** Aucune CGU mise en ligne sans avis préalable de mon service : merci de me transmettre votre projet **avant publication**, pas après.

Je fixerais au **vendredi 12h00** la remise des pièces suivantes :

- une **fiche de registre de traitement**, une ligne par traitement (compte, vidéo, questionnaire, contact recruteur, journal de connexion), avec finalité, base légale, catégories de données, durée de conservation, destinataires, et **le nom de la table ou du champ correspondant dans votre modèle**. Une fiche qui ne renvoie pas au modèle réel est un exercice de style ;
- la déclaration d'accessibilité portant les résultats des trois écrans ;
- le projet de CGU ;
- la note d'une page sur les critères de filtrage.

Je lirai la fiche de registre et le projet de CGU **l'un à côté de l'autre**. S'ils ne décrivent pas les mêmes données, c'est l'un des deux qui est faux, et il me faudra savoir lequel.

Je me permets d'insister. Sur ce dossier en particulier, je ne pourrai pas rendre d'avis favorable sans ces éléments.

Bien cordialement,

Florine Pontaillac - Conseillère juridique
Cabinet du Ministre - Ministère du Job et Bonheur

---

## Summary of Action Items & Legal Requirements

**Deadline:** Friday 12h00.

**1. Code / Database Changes Required:**

- **Video Consent Logging**: Must store date, time, and exact text version of the consent agreement in the DB when a user uploads a video.
- **Hard Deletion**: Revoking consent must trigger an absolute physical deletion of the video file (not just a soft-delete/hide).
- **Age Verification**: Must collect Date of Birth and block/flag minors (<16 or 16-18 regime). Need a plan for existing dev/demo accounts missing this.
- **Video Subtitles**: Video player must support and display real subtitle tracks.

**2. Deliverables Needed (Friday 12h00):**

1. **Data Processing Register**: A table mapping each process (account, video, questionnaire, recruiter contact, login logs) to its purpose, legal basis, data categories, retention period, recipients, AND the **exact DB table/field name in our schema**.
2. **Accessibility Declaration**: Results of RGAA AA manual checks (keyboard navigation, focus, contrast) for 3 specific screens: Signup, Public Profile, Recruiter Catalog.
3. **Draft Terms of Service (CGU)**: Must match the data register perfectly. Cannot publish site without this.
4. **Filtering Criteria Memo (1 page)**: List of all search filters exposed in API/UI, with a 1-sentence professional justification for each to prove non-discrimination. (Any unjustified filters must be removed).
