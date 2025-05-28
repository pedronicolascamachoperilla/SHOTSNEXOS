// Funciones utilitarias para manipular y consultar el diseño de entornos de mapas NEXO
// Basado en el archivo diseno_entornos.json

const fs = typeof require !== 'undefined' ? require('fs') : null;

class EntornoMapFunctions {
  constructor(mapData) {
    this.mapData = mapData;
  }

  // Obtener todas las zonas de combate
  getAllZones() {
    return this.mapData.zones || [];
  }

  // Obtener todos los puntos de cobertura
  getAllCoverPoints() {
    return this.mapData.coverPoints || [];
  }

  // Obtener todos los puntos elevados
  getAllHighGround() {
    return this.mapData.highGround || [];
  }

  // Obtener todas las zonas de alto riesgo/alta recompensa
  getAllRiskRewardZones() {
    return this.mapData.riskRewardZones || [];
  }

  // Obtener todos los landmarks
  getAllLandmarks() {
    return this.mapData.landmarks || [];
  }

  // Buscar zona por tipo
  getZonesByType(type) {
    return (this.mapData.zones || []).filter(z => z.type === type);
  }

  // Buscar cobertura más cercana a una posición
  getNearestCoverPoint(x, y) {
    const covers = this.getAllCoverPoints();
    if (!covers.length) return null;
    return covers.reduce((nearest, cov) => {
      const dist = Math.hypot(cov.x - x, cov.y - y);
      if (!nearest || dist < nearest.dist) return { ...cov, dist };
      return nearest;
    }, null);
  }

  // Buscar landmark por nombre
  getLandmarkByName(name) {
    return (this.mapData.landmarks || []).find(lm => lm.description && lm.description.includes(name));
  }

  // Agregar una nueva zona
  addZone(zone) {
    if (!this.mapData.zones) this.mapData.zones = [];
    this.mapData.zones.push(zone);
  }

  // Guardar el mapa actualizado (Node.js)
  saveToFile(filePath) {
    if (fs) {
      fs.writeFileSync(filePath, JSON.stringify(this.mapData, null, 2));
    }
  }
}

if (typeof module !== 'undefined') module.exports = EntornoMapFunctions;
if (typeof window !== 'undefined') window.EntornoMapFunctions = EntornoMapFunctions;
