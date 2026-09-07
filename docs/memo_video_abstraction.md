# Note d'Architecture : Abstraction du Stockage Vidéo

**Date :** 07/09/2026
**Objet :** Choix de conception de l'interface `VideoProvider` et intégration future de PeerTube.

## 1. Choix de l'Interface (VideoProvider)

L'interface `VideoProvider` a été conçue pour encapsuler totalement la logique de stockage et de distribution des médias. Elle expose les méthodes suivantes :

- `store(videoFile, subtitleFile)` : Enregistre le fichier vidéo et son sous-titre optionnel, puis retourne un `providerId` opaque.
- `status(providerId)` : Permet de connaître l'état du média (PENDING, READY, ERROR), ce qui est critique pour gérer les files d'attente de transcodage de prestataires externes.
- `playbackUrl(providerId)` : Renvoie l'URL de streaming.
- `subtitleUrl(providerId)` : *Méthode ajoutée pour garantir le respect strict du RGAA (Accessibilité).*
- `delete(providerId)` : Assure le Droit à l'Oubli en supprimant définitivement la ressource distante ou locale.

**La sécurité avant tout :**
Les vidéos ne sont plus exposées via un répertoire statique public. L'implémentation locale (`LocalVideoProvider`) range les fichiers dans un dossier système sécurisé. Le streaming est opéré par un contrôleur Node.js (`videoPlayback.ts`) qui vérifie l'identité du demandeur. Une vidéo en attente de modération (PENDING) est instantanément bloquée, rendant tout "fuitage" impossible.

## 2. Intégration future de l'instance souveraine (PeerTube)

L'implémentation factice (`DummyVideoProvider`) prouve que le système peut basculer sur un nouveau prestataire simplement en changeant la variable d'environnement `VIDEO_PROVIDER`.

Le jour où l'instance PeerTube de l'État sera livrée, la stratégie d'intégration sera la suivante :

- **Création de `PeerTubeVideoProvider.ts`** : Cette classe implémentera l'interface.
- **La méthode `store()`** initiera un upload multipart via l'API REST de PeerTube.
- **La méthode `status()`** interrogera l'API PeerTube (`/api/v1/videos/{uuid}`) pour vérifier l'état du transcodage.
- **La méthode `playbackUrl()`** renverra le lien direct `.m3u8` / HLS ou le lecteur embed fourni par PeerTube, allégeant instantanément notre bande passante.

Grâce au découplage apporté par cette abstraction, ce basculement se fera sans modifier le moindre modèle de base de données ni le moindre contrôleur métier.
