---
title: slider
---

```js
//import * as L from "npm:leaflet@1.9.4";
// Importer Leaflet depuis le CDN et le rendre global
import { L } from 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
window.L = L;

// Importer le plugin leaflet-side-by-side en utilisant index.js
await import('https://unpkg.com/leaflet-side-by-side@2.2.0/index.js');

// Inclure les fichiers CSS nécessaires
html`<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">`;
html`<link rel="stylesheet" href="https://unpkg.com/leaflet-side-by-side@2.2.0/leaflet-side-by-side.css">`;

// Créer le conteneur de la carte
const mapDiv = html`<div id="map" style="width: 100%; height: 600px;"></div>`;

// Initialiser la carte et ajouter les couches
// Initialiser la carte centrée sur votre localisation
const map = L.map(mapDiv).setView([-12.78081553844026, 45.227656507434695], 14);

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

// Définir la couche "Avant" (par exemple, données de 2022)
const layerBefore = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

// Définir la couche "Après" (par exemple, données de 2023)
const layerAfter = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
attribution: '&copy; OpenTopoMap contributors',
}).addTo(map);

// Ajouter le contrôle side-by-side
const sideBySide = L.control.sideBySide(layerBefore, layerAfter).addTo(map);

// Retourner la carte pour l'afficher
map;

```