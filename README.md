# CRaTT

## Pour avoir la géométrie d'ilots au bon millésime :
La géométrie des ilots est arrêtée chaque année au 31 Octobre de l'année  , c'est cette géographie qui s'applique pendant le RP. (Par ex pour l'enquête annuelle de recensement 2026 on veut la géométrie d'ilots arrêtée au 31 Octobre 2025). Dans tous les cas il faudra s'assurer que le SERN Géographie et le ST Mayotte ont bien les mêmes ilots en tête (il y aura peut être des chnagements hors cardre habituel étant donnée l'urgence).
On peut la demander au SERN géographie :DR69-SeRN-repertoires-geographie <dr69-sern-repertoires-geographie@insee.fr>

## Petit ajout Clément :
- les données sont générées au moment du buil de la page par les codes présents dans le répertrtoire data.
ces codes peuvent être en n'importe quels langages et doivent juste printer à la fin les data au foormat souhaité (json parquet..)
- les fichiers de code doivent porter le nom et le format du fichier exemple fibonacci.json.py, sera appelé lorsqu'on voudra 
ouvrir le fichier généré par ce dernier avec FileAttachement("data/fibonacci.json").json() -> .py python n'est pas que le seul langage possible ici !
C'est l'idée des data laoaders 
- l'ordre d'apparition des pages dépend de l'ordre alphabétique du nom des .md correspondant, le titre de la page est donné par la balise title
- index donne la page d'accueil
## La suite
This is an [Observable Framework](https://observablehq.com/framework) app. To start the local preview server, run:

```
curl -s https://deb.nodesource.com/setup_20.x | sudo bash
sudo apt install nodejs -y
npm install
pip install -r requirements.txt
npm run dev -- --port 5000 --host 0.0.0.0
```

Then visit <http://localhost:5000> to preview your app.

Pour kill le port 5000 :

```
fuser -k 5000/tcp
```

For more, see <https://observablehq.com/framework/getting-started>.

## Project structure

A typical Framework project looks like this:

```ini
.
├─ src
│  ├─ components
│  │  └─ timeline.js           # an importable module
│  ├─ data
│  │  ├─ launches.csv.js       # a data loader
│  │  └─ events.json           # a static data file
│  ├─ example-dashboard.md     # a page
│  ├─ example-report.md        # another page
│  └─ index.md                 # the home page
├─ .gitignore
├─ observablehq.config.js      # the app config file
├─ package.json
└─ README.md
```

**`src`** - This is the “source root” — where your source files live. Pages go here. Each page is a Markdown file. Observable Framework uses [file-based routing](https://observablehq.com/framework/routing), which means that the name of the file controls where the page is served. You can create as many pages as you like. Use folders to organize your pages.

**`src/index.md`** - This is the home page for your app. You can have as many additional pages as you’d like, but you should always have a home page, too.

**`src/data`** - You can put [data loaders](https://observablehq.com/framework/loaders) or static data files anywhere in your source root, but we recommend putting them here.

**`src/components`** - You can put shared [JavaScript modules](https://observablehq.com/framework/javascript/imports) anywhere in your source root, but we recommend putting them here. This helps you pull code out of Markdown files and into JavaScript modules, making it easier to reuse code across pages, write tests and run linters, and even share code with vanilla web applications.

**`observablehq.config.js`** - This is the [app configuration](https://observablehq.com/framework/config) file, such as the pages and sections in the sidebar navigation, and the app’s title.

## Command reference

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `npm install`            | Install or reinstall dependencies                        |
| `npm run dev`        | Start local preview server                               |
| `npm run build`      | Build your static site, generating `./dist`              |
| `npm run deploy`     | Deploy your app to Observable                            |
| `npm run clean`      | Clear the local data loader cache                        |
| `npm run observable` | Run commands like `observable help`                      |
