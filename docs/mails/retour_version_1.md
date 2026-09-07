# [Cabinet] ProfilsActifs : retour à la version 1 du cahier des charges (instruction du cabinet)

**De :** Benjamin Sellami <b.sellami@job-et-bonheur.fr>
**Date :** Lundi 7 septembre 2026 15:18
**À :** Gustave Binet <gustave.binet@epitech.eu>

---

Bonjour,

Benjamin Sellami. Deuxième message de la journée, et celui-là est plus lourd que le premier. Je sors de deux heures avec le directeur de cabinet, Florine Pontaillac et Thomas Vignal. Le Ministre a été convoqué à Matignon.

Je vais être direct : c'est mon cahier des charges qui a été détourné, et c'est votre travail qui en subit les conséquences. J'en suis sincèrement désolé.

Instruction : retour à la version 1.0 du cahier des charges, celle du lundi 31 août. Le document annoté du 1er septembre est retiré. Relisez la version 1.0, c'est elle qui fait foi, et elle disait déjà l'essentiel : ProfilsActifs est un outil de valorisation des compétences, pas un réseau social.

## Ce qui disparaît, sans discussion

1. **Tout lien, même indicatif, entre l'engagement et les droits sociaux.** Aucune mention d'allocation, de seuil, de « seuil d'activité minimale », de droits, de calcul, de perte. Pas dans l'interface, pas dans les CGU, pas dans un commentaire de code, pas dans un nom de variable. Et je ne parle pas seulement de votre code applicatif : vos migrations, vos jeux de données, vos tests, vos fichiers de traduction, votre documentation d'API, vos maquettes. Vous ferez la recherche sur l'ensemble du dépôt et vous me joindrez la sortie brute, telle quelle. S'il reste des occurrences, elles restent pour une raison que vous m'écrivez en une ligne.
2. **Les compteurs d'engagement publics.** Plus de nombre de « j'aime » affiché. Ni sur la fiche publique, ni sur la fiche recruteur, ni dans le feed, ni dans un export, ni dans une réponse de votre API. Vous gardez la donnée en base, vous coupez toutes les sorties.
3. **Le feed vertical plein écran en lecture automatique.** Vous revenez à une grille de profils paginée, 20 par page, lecture vidéo à la demande, sur clic. Les anciennes adresses du feed ne doivent pas renvoyer une erreur : redirigez-les vers la grille.
4. **Le « permis de travailler ».** Cette expression n'existe plus. Le dispositif s'appelle un badge de certification, et il n'ouvre aucun droit : il valorise, il n'autorise pas.
5. **Le questionnaire passe de 100 à 20 questions.** Et il n'est plus un prérequis d'accès (un candidat peut être consulté sans certification).
   - Vous devez choisir quelles 20 questions garder (critère en 5 lignes).
   - Décidez du sort des badges déjà attribués (recalcul, invalidation ou marquage).
   - Créez un script rejouable pour ce traitement, avec stats avant/après.
6. **Le nom de travail du Ministre (JibJob).** Interface, dépôt, branches, documents, métadonnées. Le service s'appelle ProfilsActifs.

### Ce que vous ajoutez

- Un **bandeau permanent** en haut de l'espace candidat, portant exactement cette phrase :
  *« Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations. »*
  (Sur tous les écrans candidat, y compris connexion et erreur).

### Ce qui doit continuer de marcher

- Inscription candidat
- Dépôt vidéo
- Consultation recruteur

### Échéances

- Demain mardi 12h00 pour l'ensemble des retraits et le bandeau.
- Mercredi 12h00 possible pour le point 5 (script questionnaire) si prévenu ce soir.
- Fournir un journal des modifications daté, ligne par ligne.

Je suis joignable ce soir, tard si besoin. Vous n'êtes pas responsables de cette situation.

Benjamin Sellami - Conseiller en communication

---

## Résumé des Actions & Contraintes (Matignon Rollback)

**Échéances :** Mardi 12h00 pour la plupart des retraits. Mercredi 12h00 toléré pour le script de reprise de données du questionnaire.

**1. Modifications de Code / Base de données :**

- **Nettoyage Sémantique (Droits Sociaux)** : Suppression totale de toute mention liant l'application aux droits/allocations chômage (UI, BDD, commentaires, variables). Remplacement strict de "Permis de travailler" par "Badge de certification". Le mot "JibJob" disparaît au profit de "ProfilsActifs".
- **Bandeau Légal** : Ajout d'un bandeau permanent sur toutes les pages de l'espace candidat : *"Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations."*
- **UI & Feed** : Suppression du feed vertical plein écran en autoplay. Remplacement par une grille paginée (20 max) avec lecture vidéo au clic. Redirection 301 des anciennes URL du feed vers la grille.
- **Compteurs Publics** : Suppression absolue des compteurs de likes/vues de toutes les sorties publiques ou API.
- **Questionnaire** : Passage de 100 à 20 questions (non-bloquant pour la visibilité). Création d'un script (`backend/scripts/migrate_badges.ts`) pour gérer les anciens badges/scores avec statistiques de l'impact.

---

## TRACE DE DÉCISION : Rollback Matignon (OVERRIDE)

- **Décision :** Nous appliquons strictement l'ordre de retour à la Version 1 (rollback total des mécaniques de réseau social et des ambiguïtés liées aux droits sociaux).
- **Trace d'Override :** Cet ordre annule **intégralement** la vision "TikTok pour l'emploi" et "Permis conditionnant les droits" initialement poussée par le Ministre dans ses annotations.
- **Justification :** L'instruction directe du Directeur de cabinet (suite à une convocation à Matignon) prévaut sur la vision initiale du produit. Le risque de controverse politique sur le lien entre engagement social et allocations chômage force le retrait immédiat de ces mécaniques.
