// loaders.js

import { calculateQuantiles,generateStyleFunction,} from "../utils/fonctions.js";


export function getOSM() {
    const OSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 21,
      });
    return {'OpenStreetMap clair': OSM}
}

export function getOSMDark() {
    const OSMDark  = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
        subdomains: 'abcd',
          maxZoom: 21,
      });
    return {'OpenStreetMap sombre': OSMDark}
}

export function getMarker(center) {
    // Créer un icône personnalisé pour le marqueur
    const crossIcon = L.divIcon({
        className: 'custom-cross-icon',
        html: '<div style="width: 10px; height: 10px; background-color: black; border: 2px solid white; border-radius: 50%;"></div>',
        iconSize: [10, 10], // Taille de l'icône
        iconAnchor: [5, 5]  // Point d'ancrage de l'icône (centre de l'icône)
    });
    const marker  = L.marker(center, { icon: crossIcon })
    return marker
}

export function getSatelliteImages(config) {
    const { availableYears, name } = config;
    const satelliteImages = {};
    const urlGeoServer = "https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms";
    const workSpace = "dirag";

    // Get tile for each year
    availableYears.forEach(year => {
        const layer = L.tileLayer.wms(urlGeoServer, {
            layers: `${workSpace}:${name}_${year}`,
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
            opacity: 1,
            maxZoom: 21,
            attribution: `Pleiades &copy; CNES ${year}, Distribution AIRBUS DS`
        });
        satelliteImages[`Pleiades ${year}`] = layer;
    });

    return satelliteImages;
}

export function getPredictions(config) {
    const { availableYears, name } = config;
    const predictions = {};
    const urlGeoServer = "https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms";
    const workSpace = "dirag";

    // Get tile for each year
    availableYears.forEach(year => {
        const layer = L.tileLayer.wms(urlGeoServer, {
            layers: `${workSpace}:${name}_PREDICTIONS_${year}`,
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
            opacity: 1,
            maxZoom: 21,
            styles : "style_multiclass",
            CQL_FILTER: "INCLUDE"
        });
        predictions[`Prédictions ${year}`] = layer;
    });

    return predictions;
}

export function getBuildingEvolutions(config, year_start, year_end, evolution) {
    const { availableYears, name } = config;
    const color = evolution === "destruction" ? "rouge" : "bleu";

    if (String(year_end) !== String(availableYears[0]) && parseInt(year_start) < parseInt(year_end)) {
        const layer = L.tileLayer.wms("https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms", {
            layers: `dirag:${name}_EVOLUTIONS_${year_end}`,
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
            opacity: 1,
            maxZoom: 21,
            styles: color,
            CQL_FILTER: `year_start = ${year_start} AND evolution = '${evolution}'`,
        });
        return layer;
    } else {
        return null;
    }
}

export function getClusters(geomData) {

    const addToolTip = (feature, layer) => {
        const communeCode = feature.properties.depcom_2018 || 'N/A';
        const ilotCode = feature.properties.code || 'N/A';
        
        layer.bindPopup(`
          <b>Code Commune:</b> ${communeCode}<br>
          <b>Code Îlot:</b> ${ilotCode}
        `);
      };
    
    const borders = L.geoJSON(geomData, {
        style: {
        fillColor: 'transparent',
        fillOpacity: 0,
        color: 'black',
        weight: 1,
        opacity: 1
      },
        onEachFeature: addToolTip
      })

    return {"Contours des îlots": borders};
}

export function getEvolutions(data, indicator) {

    // { indicator: 'area_building_change_absolute', label: 'Variation de Surface absolue', colorScale: 'blueScale', unit: 'm²' },
    // { indicator: 'area_building_change_relative', label: 'Variation de Surface relative', colorScale: 'yellowScale', unit: '%' }

    const label = 'Variation de Surface absolue';
    const colorScale = 'blueScale';
    const unit = 'm²';
    const quantileProbs = [0, 0.25, 0.5, 0.75, 1.0];
    const values = data.features.map(f => f.properties[indicator]);
    const quantiles = calculateQuantiles(values, quantileProbs);
    const style = generateStyleFunction(indicator, quantiles, colorScale);

    const addToolTip = (feature, layer) => {
        const communeCode = feature.properties.depcom_2018 || 'N/A';
        const ilotCode = feature.properties.code || 'N/A';
        
        if (feature.properties && feature.properties[indicator] !== undefined && feature.properties[indicator] !== null) {
        // Check if the value is a number before using toFixed
        const roundedValue = !isNaN(feature.properties[indicator]) 
            ? feature.properties[indicator].toFixed(1) 
            : 'NA';

        // Construct the popup content with commune code and îlot code
        layer.bindPopup(`
            <b>Code Commune:</b> ${communeCode}<br>
            <b>Code Îlot:</b> ${ilotCode}<br>
            <b>${label}:</b> ${roundedValue}${unit}
        `);
        } else {
        layer.bindPopup(`
            <b>Code Commune:</b> ${communeCode}<br>
            <b>Code Îlot:</b> ${ilotCode}<br>
            <b>${label}:</b> NA
        `);
        }
    };

    const choropleth = L.geoJson(data, {
        style: style,
        onEachFeature: addToolTip
    });

    return {"Variation de Surface absolue": choropleth};
}