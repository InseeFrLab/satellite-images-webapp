```js
import * as L from "npm:leaflet";
const mapDiv = display(document.createElement("div"));
mapDiv.style = "height: 80vh; width: 100%; margin: 0 auto;";

// Initialiser la carte avec la position centrale du département
const center = [4.937, -52.330]; // Coordonnées centrales de la Guyane française
const map = L.map(mapDiv).setView(center, 10.4); // Niveau de zoom ajusté

// Charger le CSS et JS du plugin Leaflet Fullscreen
const fullscreenCss = document.createElement("link");
fullscreenCss.rel = "stylesheet";
fullscreenCss.href = "https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/leaflet.fullscreen.css";
document.head.appendChild(fullscreenCss);

const fullscreenJs = document.createElement("script");
fullscreenJs.src = "https://api.mapbox.com/mapbox.js/plugins/leaflet-fullscreen/v1.0.1/Leaflet.fullscreen.min.js";
document.head.appendChild(fullscreenJs);

fullscreenJs.onload = function() {
  map.addControl(new L.Control.Fullscreen());
};


// Ajout d'une couche de base OpenStreetMap
const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
});

// Ajout d'une couche de base sombre pour le mode sombre
const darkBaseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
  subdomains: 'abcd',
  maxZoom: 19,
});


// Ajouter la couche de base par défaut
baseLayer.addTo(map);

// Définition des couches de base
const baseLayers = {
  'Clair': baseLayer,
  'Sombre': darkBaseLayer,
};

map;

L.control.layers(baseLayers).addTo(map);


```


```js
const polygons = FileAttachment("./data/polygons_guyane.json").json()

```


<!-- ```js
const poly  = polygons.features.map(feature => ({
    geom: feature.properties.geometry,
    filepath: feature.properties.Filepath,
  }));

const selectedPoly = view(
  Inputs.select(poly, {
    label: "Sélectionnez un polygon",
    format: d => `${d.filepath}`,
    value: poly[0]
  })
);
``` -->

```js
function createPolyBoundariesLayer(polygons) {
  const style = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: 'black',
    weight: 2,
    opacity: 1
  };

  const onEachFeature = (feature, layer) => {
    const filepath = feature.properties.Filepath || 'N/A';
    
    layer.bindPopup(`
      <b>Filepath:</b> ${filepath}
    `);
  };

  return L.geoJSON(polygons, {
    style: style,
    onEachFeature: onEachFeature
  });
}
```

```js
const polyBoundariesLayer = createPolyBoundariesLayer(polygons);
map.addLayer(polyBoundariesLayer);
```