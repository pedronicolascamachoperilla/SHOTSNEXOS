// Módulo para gestión y consulta de zonas de combate y puntos estratégicos en mapas NEXO
// Permite buscar zonas por tipo, obtener coberturas cercanas, y consultar landmarks únicos

class MapEnvironmentUtils {
  static getZonesByType(mapData, type) {
    return (mapData.zones||[]).filter(z => z.type===type);
  }
  static getNearestCover(mapData, x, y) {
    let covers = mapData.coverPoints||[];
    if(!covers.length) return null;
    covers = covers.map(cov => ({...cov, dist: Math.hypot(cov.x-x, cov.y-y)}));
    covers.sort((a,b)=>a.dist-b.dist);
    return covers[0];
  }
  static getHighGrounds(mapData) {
    return mapData.highGround||[];
  }
  static getRiskRewardZones(mapData) {
    return mapData.riskRewardZones||[];
  }
  static getLandmarks(mapData) {
    return mapData.landmarks||[];
  }
}

if(typeof window!=='undefined') window.MapEnvironmentUtils = MapEnvironmentUtils;
