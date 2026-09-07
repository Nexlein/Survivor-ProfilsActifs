# [DNI, décision] ProfilsActifs : le stockage vidéo passe derrière une abstraction

**De :** Thomas Vignal <t.vignal@job-et-bonheur.fr>
**Date :** Ven 04/09/2026 16:04

---

Bonjour,

Thomas Vignal. Message important, et je m'excuse par avance de l'horaire.

L'annonce de mise en production de ce matin a déclenché une revue de sécurité côté Direction Numérique. Sur ProfilsActifs, deux décisions en sont sorties, et elles s'appliquent dès maintenant.

1. Le stockage vidéo passe derrière une abstraction
Deux décisions, liées l'une à l'autre.

D'une part, aucun fichier vidéo ne doit plus être servi depuis votre répertoire public. Motif : nous n'avons ni chaîne de transcodage, ni modération automatisée, ni couverture juridique pour exposer directement des contenus déposés par le public. Un fichier accessible par URL devinable est un fichier hors de contrôle.

D'autre part, le Ministère provisionne une instance vidéo souveraine (PeerTube) qui hébergera ces contenus à terme. Elle n'est pas disponible. Mon secrétariat m'annonce « quatre à six semaines », ce qui signifie trois mois. Vous ne pouvez donc pas l'intégrer, et je ne vous le demande pas.

Ce que je vous demande, c'est que le jour où elle arrive, le basculement soit une ligne de configuration et non une réécriture. Concrètement :

Vous introduisez une interface de fournisseur vidéo, nommez-la comme vous voulez, exposant au minimum store(fichier) qui renvoie un identifiant opaque, status(identifiant), playbackUrl(identifiant) et delete(identifiant).
Vous en livrez une implémentation locale : fichiers stockés hors du répertoire web, servis par une route applicative contrôlée. Vérification des droits, aucun listing possible, aucune URL devinable.
Vous en livrez une implémentation factice pour l'instance ministérielle. Non fonctionnelle, mais conforme à l'interface et sélectionnable par variable d'environnement. Elle sert à démontrer que votre abstraction tient debout.
En base, votre modèle ne stocke plus un chemin de fichier mais un identifiant opaque et le nom du fournisseur.
Votre interface doit gérer un état « vidéo en cours de traitement », puisque le transcodage ne sera pas instantané, et un mode dégradé si le fournisseur ne répond pas : profil consultable, vidéo remplacée par un message explicite. Pas de page blanche, pas d'erreur 500.
Et l'intégration par lien YouTube ou Vimeo n'est pas une échappatoire acceptable : nous ne renvoyons pas les usagers d'un service public vers une plateforme publicitaire tierce. Si vous l'avez déjà implémentée, elle devient une troisième implémentation de l'interface, désactivée par défaut.

Les points qui doivent tenir
Je préfère vous les donner tout de suite, plutôt que de vous les reprocher lundi soir.

La migration de l'existant. Vous avez déjà des vidéos en base et sur le disque. Je veux un script de migration rejouable, dans le dépôt, qui affiche le nombre de lignes traitées avant et après. Pas une série de UPDATE tapés à la main dans un terminal que personne ne pourra reproduire.
La non-régression. Après votre migration, la fiche d'un profil créé en début de semaine doit encore afficher sa vidéo, se laisser modifier, et sa vidéo doit encore pouvoir être supprimée. Prenez-en un avant de commencer et notez son identifiant, c'est votre témoin.
La preuve que l'abstraction tient. Une même suite de tests qui passe contre l'implémentation locale, et qui s'exécute aussi contre l'implémentation factice en constatant les comportements attendus d'un fournisseur indisponible. Si vos tests ne s'exécutent que contre l'implémentation locale, vous n'avez pas écrit une interface, vous avez déplacé du code.
Le mode dégradé, réellement provoqué. Basculez la variable d'environnement sur le fournisseur factice, ouvrez une fiche profil, et joignez la capture. Je veux voir la page de profil intacte et le message à la place du lecteur.
La suppression réelle. delete(identifiant) doit faire disparaître les octets du disque, pas seulement la ligne en base. Florine vous demande la même chose pour la révocation du consentement, par un autre chemin. Traitez les deux une seule fois, proprement.
2. Le questionnaire devient un fichier versionné
Le contenu du questionnaire de certification ne doit plus être écrit en dur dans le code, ni saisi à la main en base. Vous le décrivez dans un fichier JSON versionné dans le dépôt (certification/questions.v1.json), avec un schéma explicite : identifiant de question, énoncé, type, options, pondération.

Deux exigences qui vont avec :

Le chargement refuse de démarrer sur un fichier invalide, avec un message qui dit laquelle des questions pose problème. Un questionnaire à moitié chargé est pire qu'un questionnaire absent.
Le fichier porte un numéro de version, et chaque passation enregistre la version sur laquelle elle a été faite. Vous vous souvenez de la question que je vous ai posée mardi sur les passations en cours quand le contenu change ? Elle n'était pas théorique. C'est maintenant qu'elle devient une colonne dans votre base.
La raison est simple. Le contenu du questionnaire va changer, plusieurs fois, et pas toujours à des horaires raisonnables. Je préfère que vous puissiez le remplacer par un commit plutôt que par une migration.

Échéance : lundi 18h00, avec une demi-page qui explique pourquoi votre interface expose ces méthodes-là et ce que vous feriez autrement le jour où l'instance ministérielle existe. Une demi-page, pas un mémoire.

---

## DECISION TRACE & SUMMARY

**1. Accepted Technical/Legal/Comms Requirements:**

- **Video Storage Abstraction:** Videos must no longer be served from a public directory. We must build a `VideoProvider` interface (`store`, `status`, `playbackUrl`, `delete`).
- **Local Implementation:** Store files outside public directory, serve via an authenticated applicative route. No guessable URLs.
- **Dummy Implementation:** For the future Sovereign PeerTube instance, toggled via env var, to prove the abstraction handles failure/pending states properly.
- **Degraded Mode:** If the provider is unavailable, the profile must load with a fallback message instead of the video (no 500 error).
- **Database Changes:** The `Video` model must store an opaque ID and provider name, instead of a direct file path.
- **Existing Video Migration:** We must write a repeatable migration script to migrate existing videos on disk and in DB to the new format.
- **Questionnaire Versioning:** Move the DB-based questionnaire to a versioned JSON file (`certification/questions.v1.json`). Validate on startup, crash if invalid.
- **Questionnaire DB Tracking:** Save the version of the questionnaire a user took in their progress/result DB row.
- **Deliverable:** A half-page memo explaining the interface design choices.

**2. DECISION TRACE: YouTube/Vimeo Links (OVERRIDE)**

- **Decision:** YouTube/Vimeo integration must be disabled/removed by default.
- **Override Trace:** This explicitly OVERRIDES previous acceptance of external link videos in the schema (the `type = "LINK"` enum in Prisma).
- **Reasoning:** A public service cannot redirect users to a third-party advertising platform.
