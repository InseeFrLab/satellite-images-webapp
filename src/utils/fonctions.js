// Function to calculate quantiles
export function calculateQuantiles(values, quantileProbs) {
  values.sort((a, b) => a - b);
  return quantileProbs.map(q => {
    const pos = (values.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    return values[base + 1] !== undefined ? values[base] + rest * (values[base + 1] - values[base]) : values[base];
  });
}

// Function to get the color based on value and quantiles
export function getColor(value, quantiles, colorScale) {
  for (let i = 0; i < quantiles.length - 1; i++) {
    if (value <= quantiles[i + 1]) {
      return colorScale[i];
    }
  }
  return colorScale[colorScale.length - 1];
}

// Function to create a style function based on a specific indicator
export function generateStyleFunction(indicator, quantiles, colorScale) {
  // Returns a function that takes 'feature' as a parameter
  return function (feature) {
    const value = feature.properties[indicator]; // Get the dynamic value based on the indicator
    return {
      fillColor: getColor(value, quantiles, colorScale),
      weight: 0.7,
      opacity: 1,
      color: 'black',
      fillOpacity: 0.7
    };
  };
}

// Function to get a WMS Tile Layer
export function getWMSTileLayer(layer, year = null, styleName = null, opacity = 1) {
  const url = 'https://geoserver-satellite-images.lab.sspcloud.fr/geoserver/dirag/wms';
  const geoserverWorkspace = 'dirag';

  // Initialize the wmsOptions object with the style parameter
  const wmsOptions = {
    layers: `${geoserverWorkspace}:${layer}`,
    format: 'image/png',
    transparent: true,
    version: '1.1.0',
    opacity: opacity,
    maxZoom: 21,
  };
  if (styleName) {
    wmsOptions.styles = styleName;
  } else  {
    wmsOptions.attribution = `Pleiades &copy; CNES_${year}, Distribution AIRBUS DS`;
  }
  // Return the tile layer with the WMS options
  return L.tileLayer.wms(url, wmsOptions);
}

// General function to create a GeoJSON layer with a specific indicator and unit
export function createGeoJsonLayer(statistics, indicator, label, quantileProbs, colorScale, unit = '%') {
  const values = statistics.features.map(f => f.properties[indicator]);
  const quantiles = calculateQuantiles(values, quantileProbs);
  const style = generateStyleFunction(indicator, quantiles, colorScale);

  const onEachFeature = (feature, layer) => {
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

  return L.geoJson(statistics, {
    style: style,
    onEachFeature: onEachFeature
  });
}

export function createIlotBoundariesLayer(statistics) {
  const style = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: 'black',
    weight: 2,
    opacity: 1
  };

  const addToolTip = (feature, layer) => {
    const communeCode = feature.properties.depcom_2018 || 'N/A';
    const ilotCode = feature.properties.code || 'N/A';
    
    layer.bindPopup(`
      <b>Code Commune:</b> ${communeCode}<br>
      <b>Code Îlot:</b> ${ilotCode}
    `);
  };

  return L.geoJSON(statistics, {
    style: style,
    onEachFeature: addToolTip
  });
}

// Function to update the legend
export function updateLegend(indicator, colorScale, quantiles, unit = '%') {
  const div = L.DomUtil.create('div', 'info legend');
  const labels = [];

  div.innerHTML += `<h4 style="color:black; text-shadow: -1px 0px 1px white, 0px -1px 1px white, 1px 0px 1px white, 0px 1px 1px white;">${indicator.label} (${unit})</h4>`;

  for (let i = 0; i < quantiles.length - 1; i++) {
    const from = quantiles[i];
    const to = quantiles[i + 1];
    const color = colorScale[i];

    labels.push(
      `<i style="background:${color}; width:18px; height:18px; float:left; margin-right:8px; opacity:1;"></i>` +
      `<span style="color:black; text-shadow: -1px 0px 1px white, 0px -1px 1px white, 1px 0px 1px white, 0px 1px 1px white;">${Math.round(from)} &ndash; ${Math.round(to)}</span> ${unit}`
    );
  }

  div.innerHTML += labels.join('<br>');

  div.style.opacity = '1';
  div.style.backgroundColor = 'white';
  div.style.padding = '8px';
  div.style.borderRadius = '5px';
  div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)';

  return div;
}



export function getIlotCentroid(statistics, depcom, code) {
  // Find the feature that matches the depcom and code
  const feature = statistics.features.find(f => 
    f.properties.depcom_2018 === depcom && f.properties.code === code
  );

  if (!feature) {
    console.error(`No feature found for depcom ${depcom} and code ${code}`);
    return null;
  }

  // Calculate the centroid of the polygon
  const polygon = feature.geometry.coordinates[0]; // Assuming it's a Polygon
  let sumX = 0, sumY = 0;
  for (let i = 0; i < polygon.length; i++) {
    sumX += polygon[i][0];
    sumY += polygon[i][1];
  }

  const centroidX = sumY / polygon.length; // Latitude
  const centroidY = sumX / polygon.length; // Longitude

  return [centroidX, centroidY];
}

