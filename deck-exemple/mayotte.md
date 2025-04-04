---
title: Mayotte
---


```js
import deck from "npm:deck.gl";
// import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
```

```js
const {DeckGL, AmbientLight, GeoJsonLayer, TileLayer, BitmapLayer, _WMSLayer, LightingEffect, PointLight} = deck;

```

```js
const test2 = FileAttachment("./data/clusters_statistics.json").json();
```

<div class="card" style="margin: 0 -1rem;">

# Mayotte
## Évolutions des bâtiments par îlot entre 2022 et 2023

<figure style="max-width: none; position: relative;">
  <div id="container" style="border-radius: 8px; overflow: hidden; background: rgb(18, 35, 48); height: 800px; margin: 1rem 0;"></div>
  <div id="legendContainer" style="position: absolute; top: 1rem; right: 1rem; filter: drop-shadow(0 0 4px rgba(0,0,0,.5));"></div>
</figure>

</div>

<div id="layerControl">
  <label><input type="checkbox" id="osmLayer" checked> OpenStreetMap</label><br>
  <label><input type="checkbox" id="pleiadesLayer2023"> Images Pléïades 2023</label><br>
  
  <label for="geojsonSelect">Choisissez la statistique par îlot à afficher :</label>
  <select id="geojsonSelect">
    <option value="geojsonLayer3" selected>Superficie des bâtiments par îlot en 2023 (m²)</option>
    <option value="geojsonLayer2">Pourcentage de bâtiments par îlot en 2023 (%)</option>
    <option value="geojsonLayer">Variations de bâti relative entre 2022 et 2023 (%)</option>
    <option value="geojsonLayer1">Variations de bâti absolue entre 2022 et 2023  (m²)</option>
  </select>
</div>

```js
// Zoom initial de la carte sur Mayotte
// Valeurs surement automatisables avec centroid et radius
const initialViewState = {
  longitude: 45.14,
  latitude: -12.81,
  zoom: 10.4,
  minZoom: 9,
  maxZoom: 17.4,
  pitch: 0,
  bearing: -5
};
```

```js
// A chaque fois que le curseur passe sur un îlot, ces infos s'affichent
function getTooltip({object}) {
  if (!object) return null;

  // Récupère et formate les valeurs
  const spfBuilding2023 = Math.round(object.properties.building_2023);
  const pctBuilding2023 = Math.round(object.properties.pct_building_2023);
  const areaBuildingChangeAbsolute = Math.round(object.properties.area_building_change_absolute);
  const areaBuildingChangeRelative = Math.round(object.properties.area_building_change_relative);

  // Ajoute un "+" devant les valeurs positives
  const formattedAreaBuildingChangeAbsolute = areaBuildingChangeAbsolute > 0 ? `+${areaBuildingChangeAbsolute}` : areaBuildingChangeAbsolute;
  const formattedAreaBuildingChangeRelative = areaBuildingChangeRelative > 0 ? `+${areaBuildingChangeRelative}` : areaBuildingChangeRelative;

  return {
    html: `
    <div><b>Superficie des bâtis 2023 (m²)</b></div>
    <div>${spfBuilding2023}m²</div>
    <div><b>Pourcentage de bâti 2023 (%)</b></div>
    <div>${pctBuilding2023}%</div>
    <div><b>Variation absolue de bâtis (m²)</b></div>
    <div>${formattedAreaBuildingChangeAbsolute}m²</div>
    <div><b>Variation relative de bâtis (%)</b></div>
    <div>${formattedAreaBuildingChangeRelative}%</div>
    <div><b>ID îlot</b></div>
    <div>${object.id}</div>
    `,
    style: {
      backgroundColor: '#ffffff',
      color: '#000000',
      fontSize: '0.8em',
      padding: '5px',
      borderRadius: '5px',
      boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.5)'
    }
  };
}
```

```js
const effects = [
  new LightingEffect({
    ambientLight: new AmbientLight({color: [255, 255, 255], intensity: 1.0}),
    pointLight: new PointLight({color: [255, 255, 255], intensity: 0.8, position: [-0.144528, 49.739968, 80000]}),
    pointLight2: new PointLight({color: [255, 255, 255], intensity: 0.8, position: [-3.807751, 54.104682, 8000]})
  })
];
```

```js
// Instantiation de la carte Deck
const deckInstance = new DeckGL({
  container,
  initialViewState: initialViewState,
  getTooltip: getTooltip,
  effects: effects,
  controller: true
});

// clean up if this code re-runs
invalidation.then(() => {
  deckInstance.finalize();
  container.innerHTML = "";
});
```

```js
// Constantes pour calculer les plages des color scales
const geojsonData = test2.features;

const valuesForLayer = geojsonData.map(f => f.properties.area_building_change_relative);
const valuesForLayer1 = geojsonData.map(f => f.properties.area_building_change_absolute);
const valuesForLayer2 = geojsonData.map(f => f.properties.pct_building_2023);
const valuesForLayer3 = geojsonData.map(f => f.properties.building_2023);
```

```js
// Légende graduée en fonction des quantiles
function calculateQuantiles(values) {
  values.sort((a, b) => a - b); // Trier les valeurs
  const quantiles = [0, 0.25, 0.5, 0.75, 1.0].map(q => {
    const pos = (values.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if ((values[base + 1] !== undefined)) {
      return values[base] + rest * (values[base + 1] - values[base]);
    } else {
      return values[base];
    }
  });
  return quantiles;
}
```

```js
const domainValues = calculateQuantiles(valuesForLayer);
const domainValues1 = calculateQuantiles(valuesForLayer1);
const domainValues2 = calculateQuantiles(valuesForLayer2);
const domainValues3 = calculateQuantiles(valuesForLayer3);
```

```js
const COLOR_SCALE = d3.scaleLinear()
  .domain(domainValues)
  .range([
    [240, 248, 255],  // Nuances de bleu
    [173, 216, 230],
    [135, 206, 250],
    [70, 130, 180],
    [0, 0, 139]
  ]);

const COLOR_SCALE_1 = d3.scaleLinear()
  .domain(domainValues1)
  .range([
    [255, 240, 245],  // Nuances de rose
    [255, 182, 193],
    [255, 105, 180],
    [255, 20, 147],
    [255, 0, 102]    
  ]);

const COLOR_SCALE_2 = d3.scaleLinear()
  .domain(domainValues2)
  .range([
    [229, 255, 229],  // Nuances de vert
    [178, 255, 178],
    [102, 255, 102],
    [34, 139, 34],
    [0, 100, 0]
  ]);

const COLOR_SCALE_3 = d3.scaleLinear()
  .domain(domainValues3)
  .range([
    [255, 255, 204], // Nuances de rouge
    [254, 200, 150],
    [253, 150, 100],
    [255, 100, 20],
    [255, 0, 0]
  ]);
```

```js
function createColorLegend(colorScale, quantileValues) {
  const minValue = Math.round(quantileValues[0]); // min
  const maxValue = Math.round(quantileValues[4]); // max

  return Plot.plot({
    margin: 0,
    marginTop: 20,
    width: 180,
    height: 35,
    style: "color: white;",
    x: { padding: 0, axis: null },
    marks: [
      Plot.cellX(colorScale.range(), { fill: ([r, g, b]) => `rgb(${r},${g},${b})`, inset: 0.5 }),
      Plot.text([minValue.toFixed(2)], { frameAnchor: "top-left", dy: -12 }),
      Plot.text([maxValue.toFixed(2)], { frameAnchor: "top-right", dy: -12 })
    ]
  });
}
```

```js
// Légende pour chaque couche stat
const COLOR_LEGEND = createColorLegend(COLOR_SCALE, domainValues);
const COLOR_LEGEND_1 = createColorLegend(COLOR_SCALE_1, domainValues1);
const COLOR_LEGEND_2 = createColorLegend(COLOR_SCALE_2, domainValues2);
const COLOR_LEGEND_3 = createColorLegend(COLOR_SCALE_3, domainValues3);
```

```js
function showLegendForLayer(layerId) {
  const legendContainer = document.getElementById('legendContainer');
  legendContainer.innerHTML = ''; // Efface la légende précédente
  
  // Déclare une variable pour le titre de la légende
  let legendTitle = '';
  
  // Légende à afficher en fonction de la couche sélectionnée
  if (layerId === 'geojsonLayer') {
    legendTitle = 'Variation relative de bâtis par îlot entre 2022 et 2023 (%)';
    legendContainer.appendChild(COLOR_LEGEND);
  } else if (layerId === 'geojsonLayer1') {
    legendTitle = 'Variation absolue de bâtis par îlot entre 2022 et 2023 (m²)';
    legendContainer.appendChild(COLOR_LEGEND_1);
  } else if (layerId === 'geojsonLayer2') {
    legendTitle = 'Pourcentage de bâtis par îlot en 2023 (%)';
    legendContainer.appendChild(COLOR_LEGEND_2);
  } else if (layerId === 'geojsonLayer3') {
    legendTitle = 'Superficie de bâtis par îlot en 2023 (m²)';
    legendContainer.appendChild(COLOR_LEGEND_3);
  }
  
  // Crée un élément pour le titre de la légende
  const titleElement = document.createElement('div');
  titleElement.textContent = legendTitle;
  titleElement.style.color = 'white'; // Couleur blanche
  titleElement.style.fontWeight = 'bold'; // texte en gras
  titleElement.style.fontSize = '16px'; // Taille de la police
  titleElement.style.marginBottom = '5px';
  
  // Ajoute le titre au conteneur de légende
  legendContainer.prepend(titleElement);
}
```

```js
const osmLayer = new TileLayer({
  id: 'TileLayer',
  data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxZoom: 19,
  minZoom: 0,
  renderSubLayers: props => {
    const {boundingBox} = props.tile;

    return new BitmapLayer(props, {
      data: null,
      image: props.data,
      bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
    });
  },
  pickable: true
});
```

```js
const geojsonLayer = new GeoJsonLayer({
  id: "geojson",
  data: test2,
  opacity: 0.2,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE(f.properties.area_building_change_relative),
  pickable: true,
});
```

```js
const geojsonLayer1 = new GeoJsonLayer({
  id: "geojson1",
  data: test2,
  opacity: 0.2,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE_1(f.properties.area_building_change_absolute),
  pickable: true,
});
```

```js
const geojsonLayer2 = new GeoJsonLayer({
  id: "geojson2",
  data: test2,
  opacity: 0.2,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE_2(f.properties.pct_building_2023),
  pickable: true,
});
```

```js
const geojsonLayer3 = new GeoJsonLayer({
  id: "geojson3",
  data: test2,
  opacity: 0.2,
  lineWidthMinPixels: 1,
  getLineColor: [60, 60, 60],
  getFillColor: f => COLOR_SCALE_3(f.properties.building_2023),
  pickable: true,
});
```

```js
const pleiadesLayer2023 = new _WMSLayer({
  id: "pleiades2023",
  data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
  serviceType: 'wms',
  layers: ['dirag:MAYOTTE_2023']
});
```

<!-- ```js
// Ne sont pas encore sur le geoserveur
const pleiadesLayer2022 = new _WMSLayer({
  id: "pleiades2022",
  data: 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms',
  serviceType: 'wms',
  layers: ['dirag:MAYOTTE_2022']
});
``` -->

```js
function uncheckOthers(selectedCheckbox) {
    // Parcourir toutes les checkboxes dans le container 'layerControl'
    const checkboxes = document.querySelectorAll('#layerControl input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
      if (checkbox !== selectedCheckbox) {
        checkbox.checked = false;
      }
    });
  }
```

```js
function updateLayers(changed) {
  const layers = [];
  const osmLayerCheckbox = document.getElementById('osmLayer');
  const pleiadesLayer2023Checkbox = document.getElementById('pleiadesLayer2023');
  
  // Vérifie l'état de la case à cocher OpenStreetMap
  if (['osmLayer', ''].includes(changed) && osmLayerCheckbox.checked) {
      layers.push(osmLayer);
      if (changed !== '') {
        uncheckOthers(osmLayerCheckbox);
      }
  }

  // Vérifie l'état de la case à cocher Pleiades 2023
  if (['pleiadesLayer2023', ''].includes(changed) && pleiadesLayer2023Checkbox.checked) {
      layers.push(pleiadesLayer2023);
      if (changed !== '') {
        uncheckOthers(pleiadesLayer2023Checkbox);
      }
  }

  // Récupère la valeur sélectionnée du menu déroulant
  const selectedGeoJsonLayer = document.getElementById('geojsonSelect').value;
  
  // Ajoute la couche GeoJsonLayer correspondante
  if (selectedGeoJsonLayer === 'geojsonLayer') {
    layers.push(geojsonLayer);
  } else if (selectedGeoJsonLayer === 'geojsonLayer1') {
    layers.push(geojsonLayer1);
  } else if (selectedGeoJsonLayer === 'geojsonLayer2') {
    layers.push(geojsonLayer2);
  } else if (selectedGeoJsonLayer === 'geojsonLayer3') {
    layers.push(geojsonLayer3);
  }
  
  // Mettre à jour les couches dans DeckGL
  deckInstance.setProps({ layers });

  // Afficher la bonne légende
  showLegendForLayer(selectedGeoJsonLayer);
}
```

```js
// Listener qui suivent les changements dans chaques cases
const osmLayerCheckbox = document.getElementById('osmLayer');
const geojsonSelectChoice = document.getElementById('geojsonSelect');
const pleiadesLayer2023Checkbox = document.getElementById('pleiadesLayer2023');

osmLayerCheckbox.addEventListener('change', () => updateLayers('osmLayer'));
geojsonSelectChoice.addEventListener('change', () => updateLayers(''));
pleiadesLayer2023Checkbox.addEventListener('change', () => updateLayers('pleiadesLayer2023'));
```

```js
// Carte à l'état initial
deckInstance.setProps({
  // layers: [
  //     new BitmapLayer(props, {
  //       data: null,
  //       image: props.data,
  //       bounds: [boundingBox[0][0], boundingBox[0][1], boundingBox[1][0], boundingBox[1][1]]
  //     });
  //   },
  //   pickable: true
  //   }),
  layers: [
    osmLayer,
    geojsonLayer3]
});
// Légende initiale
showLegendForLayer("geojsonLayer3");
```

```js
// A chaque fois que la page est rechargée, retourner aux valeurs initiales sur les checkboxes et la liste déroulante
// la carte se remet à l'état initial par défaut
window.onload = function() {
  // Réinitialiser les cases à cocher
  const checkboxes = document.querySelectorAll('#layerControl input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
      checkbox.checked = false; // Décocher toutes les cases
  });

  const checkbox = document.getElementById('osmLayer');
  checkbox.checked = true; // Cocher la case OpenStreetMap

  // Réinitialiser la liste déroulante
  const select = document.getElementById('geojsonSelect');
  select.value = 'geojsonLayer3'; // Réinitialiser à l'option par défaut
};
```