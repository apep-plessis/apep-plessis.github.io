# Agenda et documents — APEP

Page statique qui agrège les quatre agendas Google publics (l'association et les trois
écoles) et le dossier Drive des documents publics. Aucun build, aucune dépendance à
installer : les fichiers se déposent tels quels sur un hébergement statique.

## Mise en service

Tout se configure dans `js/config.js`.

### 1. Rendre les quatre agendas publics

Pour chaque agenda, dans Google Agenda → *Paramètres de l'agenda* :

- **Autorisations d'accès** → cocher **Rendre disponible publiquement**, en laissant
  *Voir tous les détails de l'événement*.
- **Intégrer l'agenda** → copier l'**ID de l'agenda** (il ressemble à
  `xxxxxxxx@group.calendar.google.com`).

L'API refuse un agenda qui n'est que « partagé par lien secret » : la case *rendre
disponible publiquement* est indispensable.

### 2. Créer la clé API

Sur [console.cloud.google.com](https://console.cloud.google.com) :

1. Créer un projet (`apep-site` par exemple).
2. *API et services* → **Activer** `Google Calendar API` **et** `Google Drive API`.
3. *Identifiants* → **Créer des identifiants** → **Clé API**.
4. Modifier la clé :
   - *Restrictions relatives aux applications* → **Sites web**, et ajouter le domaine du
     site (`https://agenda.apep.fr/*`, plus `http://localhost:*` pour les essais) ;
   - *Restrictions relatives aux API* → cocher uniquement Calendar et Drive.

La clé se retrouve en clair dans le JavaScript : c'est sans conséquence puisque les
données sont publiques, et la restriction par domaine empêche qu'on s'en serve ailleurs.

### 3. Le dossier Drive

Partager le dossier des documents publics en **« Tous les utilisateurs disposant du
lien » / Lecteur**, puis relever son identifiant dans l'URL :
`https://drive.google.com/drive/folders/`**`<identifiant>`**.

Les sous-dossiers sont listés mais s'ouvrent dans Drive : la navigation dans
l'arborescence n'est pas reproduite dans la page.

### 4. Remplir la configuration

```js
export const CONFIG = {
  apiKey: 'AIza…',
  driveFolderId: '1AbC…',
  calendars: [
    { key: 'apep', id: 'xxxx@group.calendar.google.com', label: 'APEP', short: 'APEP' },
    …
  ],
};
```

Tant que `apiKey` est vide ou qu'aucun agenda n'a d'identifiant, la page s'affiche avec
un jeu d'événements fictifs (`js/demo.js`) et un bandeau d'avertissement — pratique pour
montrer le rendu avant d'avoir les accès.

## Essayer en local

Les modules ES refusent de se charger depuis `file://`, il faut un serveur :

```sh
python3 -m http.server 8000
```

## Hébergement

N'importe quel hébergement statique : Cloudflare Pages, GitHub Pages, Netlify, ou un
simple FTP. Penser à déclarer le domaine retenu dans les restrictions de la clé API.

## Identité visuelle

Couleurs et logos tirés de `vault/perso/ecole/ape/apepb/logo/` : bleu `#6EB4E7` pour
Les Iris, vert `#95C772` pour Le Pré au Lièvre, corail `#FA8A89` pour Louisette Wattier,
encre `#1F1E21` pour l'association. **L'attribution des couleurs aux écoles est fixe.**

Un quatrième corail, `#E4615F`, sert aux éléments d'action (onglet actif, boutons, jour
courant) : c'est celui des flyers, et il reste distinct du corail de Louisette Wattier
pour qu'aucune couleur d'école ne signifie « cliquable ».

Typographie Nunito, graisse 800 pour les titres et **700 pour le corps** — c'est ce qui
donne aux supports APEP leur allure ronde. Le sigle de l'en-tête est composé en
caractères, pas en image, avec la répartition de couleurs de la charte (A vert,
P corail, E bleu, P vert) ; il s'écrit **APEP**, sans accent.

Les mains d'enfant viennent de `assets/mains/` : les trois mains pour l'association,
une main et son symbole pour chaque école. Elles servent d'icône dans les pastilles de
filtre, les fiches d'événement, les liens d'abonnement et les états vides.
