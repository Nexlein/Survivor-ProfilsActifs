# Courrier - Thomas Vignal - Versioning Questionnaire

**De :** Thomas Vignal <thomas.vignal@job-et-bonheur.fr>
**Date :** Mar 01/09/2026 21:15

---

Bonjour,

Le choix concernant la réinitialisation du questionnaire est cohérent.

Conservez la version du questionnaire associée à chaque session.

Pour le reste, continuez comme prévu.

Cordialement,

Thomas Vignal - Conseiller numérique
Cabinet du Ministre - Ministère du Job et Bonheur

---

## Summary of Action Items & Technical Requirements

**1. Code / Database Changes Required:**

- **Règle de gestion (Cross-référence avec contraintes_techniques.md)** : Thomas Vignal avait demandé ce qu'il se passait si le questionnaire change alors qu'un candidat est en cours de session. La décision validée est la **réinitialisation**. Si la version globale du questionnaire change, la progression du candidat est écrasée et il doit recommencer.
- **Traçabilité** : Chaque sauvegarde (`QuestionnaireProgress`) doit stocker la version du questionnaire (`questionnaireVersion`) qui était active au moment où le candidat a commencé.
- **Référentiel** : Il faut pouvoir stocker la `currentVersion` globale (par exemple via une table `QuestionnaireSettings`) pour pouvoir comparer : si `currentVersion > progress.questionnaireVersion`, alors on réinitialise.
