# [Juridique] ProfilsActifs : droit d'opposition et traçabilité des consultations

**De :** Florine Pontaillac <f.pontaillac@job-et-bonheur.fr>
**Date :** mercredi 9 septembre 2026 10:00

---

Bonjour,

Florine Pontaillac. Je ne vous avais plus écrit depuis mercredi dernier et j'aurais préféré que cela dure. Depuis le journal de lundi, le cabinet a reçu onze demandes de retrait émanant de personnes qui figurent à votre catalogue. Deux sont accompagnées d'un courrier d'avocat. Je ne peux donc plus traiter ce point comme une recommandation.

Deux obligations. Je vais être précise sur ce que j'entends par là, parce qu'une formulation générale ne vous aiderait pas à cette heure de la semaine.

## 1. Droit d'opposition (Le retrait du catalogue)

Le retrait du catalogue, à la main de la personne concernée. Article 21 du RGPD, droit d'opposition.

- Concrètement, un candidat doit pouvoir basculer son profil hors du catalogue depuis son espace, sans écrire à qui que ce soit et sans supprimer son compte.
- Le retrait vaut partout : catalogue public, résultats de recherche du recruteur, listes filtrées, et l'aperçu qui s'affiche quand on colle le lien dans une messagerie.
- Le lien direct vers un profil retiré ne doit renvoyer ni la fiche, ni une page d'erreur technique. Une page sobre indiquant que le profil n'est plus disponible suffit, et elle ne doit pas révéler que la personne était inscrite hier.
- Un cas que vous devez trancher et documenter en trois lignes : que voit un recruteur qui avait déjà consulté ce profil, ou qui l'avait mis de côté ? Le masquer entièrement de son historique est défendable. Le laisser visible en le signalant comme retiré l'est aussi. Faire comme s'il n'avait jamais existé ne l'est pas.
- Le retrait doit être réversible par la personne elle-même. Un droit d'opposition qui ne se lève pas devient une sanction.

## 2. Traçabilité des consultations (Droit d'accès)

La traçabilité des consultations. Article 15, droit d'accès.

- Une personne inscrite doit pouvoir savoir qui a regardé son profil et quand. C'est aussi, accessoirement, la seule réponse que le cabinet pourra opposer à la question « qui a vu mes données » quand elle sera posée en séance, et elle le sera.
- Un enregistrement par consultation d'une fiche par un compte recruteur : date, heure, et l'organisation, pas la personne physique. Je ne veux pas résoudre un problème en en créant un second.
- Pas d'adresse IP, pas d'empreinte de navigateur, pas de géolocalisation du recruteur. Vous constituez un journal de transparence, pas un fichier de surveillance.
- Ce journal est visible par le candidat depuis son espace, dans l'ordre chronologique inverse, et il n'est visible que par lui.
- Les consultations anonymes, hors compte, ne sont pas enregistrées. Dites-le explicitement à l'écran plutôt que de laisser croire à un décompte exhaustif.

Échéance : jeudi, avant la revue technique. J'ai conscience de ce que cette semaine vous a déjà coûté et je ne l'ignore pas en écrivant cette phrase.

Si les deux points ne tiennent pas dans le temps qu'il vous reste, traitez le premier et écrivez-moi que le second est différé, avec une date. Le retrait prime : c'est celui que onze personnes réclament aujourd'hui, et c'est celui dont l'absence nous serait reprochée. Un journal de consultations livré vendredi soir ne réparera rien, tandis qu'un retrait qui fonctionne jeudi nous permet de répondre à ces onze courriers.

Je vous écris un mercredi matin sur un dossier que je vous savais déjà surchargé, et je le regrette. Sur le fond, en revanche, je n'ai pas le choix, et je préfère vous l'adresser maintenant plutôt qu'en découvrir l'absence vendredi devant la presse.

Bien cordialement,

Florine Pontaillac - Conseillère juridique
Cabinet du Ministre - Ministère du Job et Bonheur

---

## DECISION TRACE & SUMMARY

**1. Accepted Technical/Legal/Comms Requirements:**

- **Withdrawal from catalog (Droit d'opposition)**: Must be an autonomous, reversible action by the candidate.
- Withdrawn profiles must completely disappear from the catalog, search results, and filtered lists.
- Direct links to a withdrawn profile must show a neutral "Profile no longer available" page (no 404/403, no leak of past existence).
- History view for recruiters must display the profile as a "Withdrawn" tombstone, explicitly notifying them it was withdrawn.
- **Consultation trace (Droit d'accès)**: Candidate must see a log of recruiters who viewed their profile (Date, Time, Organization name only).
- NO technical tracking data (IP, browser fingerprint, geolocation) allowed in this log.
- Anonymous views are not logged; a warning must state this clearly to the candidate.
- Highest priority is the Withdrawal feature. The Consultation trace can be deferred if necessary, but we aim for both.

**2. DECISION TRACE: Profile Deletion vs Withdrawal (OVERRIDE)**

- **Decision:** Implement a `visible` boolean toggle rather than hard deletion for the right to object, and use a generic HTTP 410 / Generic UI for direct access. For recruiter history, use a "Withdrawn" tombstone.
- **Reasoning:** Full account deletion is disproportionate for simple catalog withdrawal. The 410 Gone with generic UI prevents enumeration attacks (discovering who recently left). The tombstone in recruiter history prevents confusion ("did I imagine saving this profile?") while respecting the candidate's withdrawal.
