// config.js

export const quantileProbs = [0, 0.25, 0.5, 0.75, 1.0];

export const colorScales = {
  greenScale: ['#E5FFE5', '#B2FFB2', '#66FF66', '#228B22', '#006400'],
  blueScale: ['#F0F8FF', '#ADD8E6', '#87CEFA', '#4682B4', '#00008B'],
  redScale: ['#FFF0F5', '#FFB6C1', '#FF69B4', '#FF1493', '#FF0066'],
  yellowScale: ['#FFFFCC', '#FEE391', '#FEC44F', '#FE9929', '#D95F0E']
};

// Configuration des départements avec des coordonnées spécifiques et des couches supplémentaires
export const departmentConfig = {
  mayotte: {
    name: 'MAYOTTE',
    // center: [-12.78081553844026, 45.227656507434695],
    availableYears: ['2017', '2018', '2019', '2020', '2021','2022','2023', '2024', '2025'],
  },
  reunion: {
    name: 'REUNION',
    // center: [-20.88545500487541, 55.452336559309124],
    availableYears: ['2022','2023'],
  },
  guadeloupe: {
    name: 'GUADELOUPE',
    // center: [-20.88545500487541, 55.452336559309124],
    availableYears: ['2020','2022'],
  }
};
