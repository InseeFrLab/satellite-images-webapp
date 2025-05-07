```js
import {getConfig} from "./components/config.js";
import {transformData} from "./components/build-table.js";
import {getIlotCentroid} from "./utils/fonctions.js";
import {getOSM, getOSMDark, getMarker, getSatelliteImages, getPredictions, getClusters, getEvolutions, getBuildingEvolutions} from "./components/map-layers.js";
import {filterObject} from "./components/utils.js";

```
```js
// Get the department from the URL parameter
const department = "saint-martin";
console.log(`The current department is ${department}`);
```

```js
// Fonction pour formater le nom du département (première lettre en majuscule)
function formatdepartmentName(nom) {
  return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
}
// Crée un élément h1 avec le nom du département
const titre = html`<h1>COM : ${formatdepartmentName(department)}</h1>`;
display(titre);
```


```js
const configg = getConfig(department);
```

```js
const available_years = configg["availableYears"]
```

```js
const year_start = available_years[0]
```


## Carte

```js
const center = configg.center
console.log(center)
```
```js
// Initialisation de la carte Leaflet
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 600px; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const map = L.map(mapDiv, {
            center: center,
            zoom: 17,           
            maxZoom: 21 //(or even higher)
        });

// Ajout d'une couche de base OpenStreetMap
const OSM = getOSM();
const OSMDark  = getOSMDark();
const marker = getMarker(center);

const PLEIADES =  getSatelliteImages(configg);
const selectedPleiades = filterObject(PLEIADES, [`Pleiades ${year_start}`,])

const PREDICTIONS = getPredictions(configg)
const selectedPredictions = filterObject(PREDICTIONS, [`Prédictions ${year_start}`,])

const buildingLayerStart = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
  cql_filter: `label='1'`,
  styles: 'contour_bleu',
});

// Ajout des couches par défaut
OSM['OpenStreetMap clair'].addTo(map);

// Ajouter le marqueur à la carte
marker.addTo(map);

// Définition des labels et couleurs
const legendItems = [
  {name: "Batiment", color: "rgb(206, 112, 121)"},
  {name: "Zone imperméable", color: "rgb(166, 170, 183)"},
  {name: "Zone perméable", color: "rgb(152, 119, 82)"},
  {name: "Piscine", color: "rgb(98, 208, 255)"},
  {name: "Serre", color: "rgb(185, 226, 212)"},
  {name: "Sol nu", color: "rgb(187, 176, 150)"},
  {name: "Surface eau", color: "rgb(51, 117, 161)"},
  {name: "Neige", color: "rgb(233, 239, 254)"},
  {name: "Conifère", color: "rgb(18, 100, 33)"},
  {name: "Feuillu", color: "rgb(76, 145, 41)"},
  {name: "Coupe", color: "rgb(228, 142, 77)"},
  {name: "Brousaille", color: "rgb(181, 195, 53)"},
  {name: "Pelouse", color: "rgb(140, 215, 106)"},
  {name: "Culture", color: "rgb(222, 207, 85)"},
  {name: "Terre labourée", color: "rgb(208, 163, 73)"},
  {name: "Vigne", color: "rgb(176, 130, 144)"},
  {name: "Autre", color: "rgb(34, 34, 34)"}
];

// Créer les couches individuelles pour chaque classe
const predictionLayers = {};

predictionLayers[`Contours Bâtiments ${year_start}`] = buildingLayerStart;

// Ajouter la couche "all_pred"
const allPredLayerStart = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
});
predictionLayers[`Prédictions multiclasse ${year_start}`] = allPredLayerStart;

// Ajouter la couche "all_pred"
const allPredLayerEnd = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
});
predictionLayers[`Prédictions multiclasse ${year_start}`] = allPredLayerEnd;

// Ajouter un contrôle de couches à la carte
L.control.layers({...OSM, ...OSMDark, ...selectedPleiades}, predictionLayers, { collapsed: false }).addTo(map);

// Ajouter le marqueur si besoin
marker.addTo(map);

// Création de la légende à gauche avec texte noir
const legend = htl.html`
  <div class="legend" style="
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    z-index: 1000;
    max-height: 70vh;
    overflow-y: auto;
    color: black;  /* Texte en noir */
  ">
    <h4 style="margin: 0 0 10px 0; color: black;">Légende multiclasse</h4>
    ${legendItems.map(item => htl.html`
      <div style="display: flex; align-items: center; margin-bottom: 5px">
        <div style="
          width: 18px;
          height: 18px;
          background: ${item.color};
          margin-right: 8px;
          opacity: 0.7;
          border-radius: 3px;
        "></div>
        <span style="color: black;">${item.name}</span>
      </div>
    `)}
  </div>
`;

// Ajout de la légende à la carte
mapDiv.appendChild(legend);
```