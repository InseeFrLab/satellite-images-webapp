```js
import {loadDepartmentGeom, loadDepartmentLevel, loadDepartmentEvol} from "../components/loaders.js";
import {getConfig} from "../components/config.js";
import {transformData} from "../components/build-table.js";
import {getIlotCentroid} from "../utils/fonctions.js";
import {getOSM, getOSMDark, getMarker, getSatelliteImages, getPredictions, getClusters, getEvolutions} from "../components/map-layers.js";
import {filterObject} from "../components/utils.js";

```
```js
// Get the department from the URL parameter
const department = new URL(window.location.href).pathname.split('/').pop();
console.log(`The current department is ${department}`);
```

```js
// Fonction pour formater le nom du département (première lettre en majuscule)
function formatdepartmentName(nom) {
  return nom.charAt(0).toUpperCase() + nom.slice(1).toLowerCase();
}
// Crée un élément h1 avec le nom du département
const titre = html`<h1>Informations géographiques : ${formatdepartmentName(department)}</h1>`;
display(titre);
```


```js
const configg = getConfig(department);
const geom = await loadDepartmentGeom(department);
const level = await loadDepartmentLevel(department);
const evol = await loadDepartmentEvol(department);
```

```js
const available_years = configg["availableYears"]
const years_select = view(Inputs.form({
  year_start : Inputs.select(available_years, {value: available_years[0], label: "Année début"}),
  year_end : Inputs.select(available_years, {value: available_years[1], label: "Année fin"})
},
 {
    template: (formParts) => htl.html`
     <div>
       <div style="
         width: 400px;
         display: flex;
         gap: 10px;
       ">
         ${Object.values(formParts)}
       </div>
     </div>`
  }
))
```

```js
const year_start = years_select["year_start"]
const year_end = years_select["year_end"]
const data_select = transformData(evol, level, year_start, year_end);
```

```js
 //récupération du centre de l'ilot à partir de l'ilot sélectionné
    const placeholder_commune = data_select[0].depcom_2018
    const placeholder_ilot = data_select[0].code
    const placeholder_param = placeholder_commune + " " + placeholder_ilot
 ```

 ```js
 const search = view(
      Inputs.search(data_select, 
      {
        placeholder: placeholder_param,
        columns:["depcom_2018","code"]
      })
    )
```

```js
    const search_table = view(
      Inputs.table(search, {
        columns: ['depcom_2018', 'code', `aire_${year_end}`, `pourcentage_bati_${year_end}`, 'evol_abs', 'evol_rela'],
        header: {
          depcom_2018: 'Code Commune',
          code: 'Code Îlot',
          [`aire_${year_end}`]: `Surface bâtie ${year_end} (m²)`,
          [`pourcentage_bati_${year_end}`]: `Surface bâtie ${year_end} (%)`,
          evol_abs: 'Écart absolu (m²)',
          evol_rela: 'Écart relatif (%)'
        },
        width: {
          depcom_2018: 120,
          code: 100,
          [`aire_${year_end}`]: 120,
          [`pourcentage_bati_${year_end}`]: 90,
          evol_abs: 120,
          evol_rela: 120
        },
        format: {
          [`aire_${year_end}`]: x => Math.round(x),
          [`pourcentage_bati_${year_end}`]: x => Math.round(x),
          evol_abs: x => Math.round(x),
          evol_rela: x => (Math.round(x * 10) / 10)
        },
        sort: {
          column: 'depcom_2018',
          reverse: false
        },
        rows: 10
      })
    )
```


## Analyse des îlots

```js
const center = getIlotCentroid(
    geom,
    search[0]?.depcom_2018 || placeholder_commune,
    search[0]?.code || placeholder_ilot
  )
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
const BORDERS = getClusters(geom);

const PLEIADES =  getSatelliteImages(configg);
const selectedPleiades = filterObject(PLEIADES, [`Pleiades ${year_start}`, `Pleiades ${year_end}`,])

const PREDICTIONS = getPredictions(configg)
const selectedPredictions = filterObject(PREDICTIONS, [`Prédictions ${year_start}`, `Prédictions ${year_end}`,])

// Création des couches de prédictions bâtiments pour les deux années
const buildingLayerStart1 = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
  cql_filter: `label='1'`,
  styles: 'blanc_opaque',
});

const buildingLayerEnd1 = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_end}`]._url, {
  ...selectedPredictions[`Prédictions ${year_end}`].options,
  cql_filter: `label='1'`,
  styles: 'bleu',
});

const buildingLayerStart2 = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
  cql_filter: `label='1'`,
  styles: 'rouge',
});

const buildingLayerEnd2 = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_end}`]._url, {
  ...selectedPredictions[`Prédictions ${year_end}`].options,
  cql_filter: `label='1'`,
  styles: 'blanc_opaque',
});

const buildingLayerStart = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
  cql_filter: `label='1'`,
  styles: 'contour_bleu',
});

const buildingLayerEnd = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_end}`]._url, {
  ...selectedPredictions[`Prédictions ${year_end}`].options,
  cql_filter: `label='1'`,
  styles: 'contour_rouge',
});

const constructionLayer = L.layerGroup([buildingLayerEnd1, buildingLayerStart1]);

const destructionLayer = L.layerGroup([buildingLayerStart2, buildingLayerEnd2]);

//map.addLayer(buildingLayerEnd);

// Ajout des couches par défaut
OSM['OpenStreetMap clair'].addTo(map);
BORDERS['Contours des îlots'].addTo(map);

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
predictionLayers[`Contours Bâtiments ${year_end}`] = buildingLayerEnd;

predictionLayers[`Constructions Bâtiments entre ${year_start} et ${year_end} (en bleu)`] = constructionLayer;
predictionLayers[`Destructions Bâtiments entre ${year_start} et ${year_end} (en rouge)`] = destructionLayer;


// legendItems.forEach((item, index) => {
//   const layerName = `${item.name} ${year_end}`;
//   const layer = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_end}`]._url, {
//     ...selectedPredictions[`Prédictions ${year_end}`].options,
//     cql_filter: `label='${index + 1}'`,  // Attention à l'encodage des quotes si nécessaire
//     zIndex: 9999
//   });
//   predictionLayers[layerName] = layer;
// });

// Ajouter la couche "all_pred"
const allPredLayerStart = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_start}`]._url, {
  ...selectedPredictions[`Prédictions ${year_start}`].options,
});
predictionLayers[`Prédictions multiclasse ${year_start}`] = allPredLayerStart;

// Ajouter la couche "all_pred"
const allPredLayerEnd = L.tileLayer.wms(selectedPredictions[`Prédictions ${year_end}`]._url, {
  ...selectedPredictions[`Prédictions ${year_end}`].options,
});
predictionLayers[`Prédictions multiclasse ${year_end}`] = allPredLayerEnd;

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

// // Deuxième contrôle : couches de prédiction individuelles avec titre
// const predictionDetailControl = L.control.layers(null, predictionLayers, {
//   position: 'topright',
//   collapsed: true
// }).addTo(map);

// // Ajout d'un titre au contrôle
// const predictionControlDiv = predictionDetailControl.getContainer();
// const title = L.DomUtil.create('div', 'prediction-control-title');
// title.innerHTML = `<h4 style="
//   margin: 0 0 8px 0;
//   padding: 0;
//   color: black;
//   font-size: 14px;
// "> labels ${year_end}</h4>`;
// predictionControlDiv.insertBefore(title, predictionControlDiv.firstChild);

// Ajout de la légende à la carte
mapDiv.appendChild(legend);
```
