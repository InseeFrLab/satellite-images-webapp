// config.js
import {FileAttachment} from "observablehq:stdlib";

export const quantileProbs = [0, 0.25, 0.5, 0.75, 1.0];

export const colorScales = {
  greenScale: ["#E5FFE5", "#B2FFB2", "#66FF66", "#228B22", "#006400"],
  blueScale: ["#F0F8FF", "#ADD8E6", "#87CEFA", "#4682B4", "#00008B"],
  redScale: ["#FFF0F5", "#FFB6C1", "#FF69B4", "#FF1493", "#FF0066"],
  yellowScale: ["#FFFFCC", "#FEE391", "#FEC44F", "#FE9929", "#D95F0E"]
};

// Configuration des départements avec des coordonnées spécifiques et des couches supplémentaires
export const departmentConfig = {
  guadeloupe: {
    name: "GUADELOUPE",
    availableYears: ["2018", "2019", "2020","2022"],
    geomFile: () => FileAttachment('../data/guadeloupe_clusters_geom.json'),
    levelFile: () => FileAttachment('../data/guadeloupe_clusters_level.parquet'),
    evolFile: () => FileAttachment('../data/guadeloupe_clusters_evol.parquet'),
    // center: [16.238104315569817, -61.53360948223629],

  },
  guyane: {
    name: "GUYANE",
    availableYears: ["2022","2023","2024"],
    geomFile: () => FileAttachment('../data/guyane_clusters_geom.json'),
    levelFile: () => FileAttachment('../data/guyane_clusters_level.parquet'),
    evolFile: () => FileAttachment('../data/guyane_clusters_evol.parquet'),
    // center: [4.939431292357986, -52.331352519102815],
  },
  reunion: {
    name: "REUNION",
    availableYears: ["2018", "2022","2023"],
    geomFile: () => FileAttachment('../data/reunion_clusters_geom.json'),
    levelFile: () => FileAttachment('../data/reunion_clusters_level.parquet'),
    evolFile: () => FileAttachment('../data/reunion_clusters_evol.parquet'),
    // center: [-20.88545500487541, 55.452336559309124],

  },
  martinique: {
    name: "MARTINIQUE",
    availableYears: ["2018","2022"],
    geomFile: () => FileAttachment('../data/martinique_clusters_geom.json'),
    levelFile: () => FileAttachment('../data/martinique_clusters_level.parquet'),
    evolFile: () => FileAttachment('../data/martinique_clusters_evol.parquet'),
    // center: [14.605520170868523, -61.06995677007423],

  },
  mayotte: {
    name: "MAYOTTE",
    availableYears: ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025"],
    geomFile: () => FileAttachment('../data/mayotte_clusters_geom.json'),
    levelFile: () => FileAttachment('../data/mayotte_clusters_level.parquet'),
    evolFile: () => FileAttachment('../data/mayotte_clusters_evol.parquet'),
    // center: [-12.78081553844026, 45.227656507434695],
  },
  "saint-martin": {
    name: "SAINT-MARTIN",
    availableYears: ["2024"],
    geomFile: () => FileAttachment('../data/saint-martin_clusters_geom.json'),
    // levelFile: () => FileAttachment('../data/saint-martin_clusters_level.parquet'),
    // evolFile: () => FileAttachment('../data/saint-martin_clusters_evol.parquet'),
    center: [18.070744391845302, -63.080322797579946]
  }
};

export function getConfig(department) {
  const config = departmentConfig[department];
  if (!config) {
    console.error(`Department ${department} does not exist in the configuration.`);
    return null;
  }
  return config
}
