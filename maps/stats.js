// Estadísticas globales y récords por mapa NEXO
// - Récords de jugadores por mapa
// - Estadísticas globales y personales
// - Visualización de rankings en el menú de mapas
// - Integración con logros y comunidad

// Este archivo es un stub para la lógica de estadísticas globales y récords por mapa.
// Puedes expandirlo para almacenar y mostrar récords, mejores tiempos, etc.

// Ejemplo de estructura:
// {
//   "mapId": "ciudad_ruinas",
//   "bestTime": 120,
//   "topPlayers": ["jugador1", "jugador2"]
// }

// Si deseas la integración automática de la lógica, solicita la función específica.

class MapStats {
  constructor() {
    this.stats = {};
  }
  setBestTime(mapId, time, user) {
    if(!this.stats[mapId]||this.stats[mapId].bestTime>time) {
      this.stats[mapId]={bestTime:time,topPlayers:[user]};
    } else if(this.stats[mapId].bestTime===time) {
      this.stats[mapId].topPlayers.push(user);
    }
  }
  getStats(mapId) {
    return this.stats[mapId]||null;
  }
}
window.MapStats = MapStats;
