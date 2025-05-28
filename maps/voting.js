// Votación multijugador de mapas en NEXO
// - Sistema de votación antes de cada partida
// - Visualización de resultados en tiempo real
// - Integración con comunidad y filtros
// - Accesibilidad para votación con teclado

// Este archivo es un stub para la lógica de votación multijugador de mapas.
// Puedes expandirlo para permitir que los jugadores voten por el siguiente mapa en partidas online.

// Ejemplo de función:
// function voteForMap(user, mapId) { ... }

// Si deseas la integración automática de la lógica, solicita la función específica.

// Votación multijugador de mapas NEXO
class MapVoting {
  constructor(mapsList) {
    this.mapsList = mapsList;
    this.votes = {};
  }
  vote(user, mapId) {
    if(!this.votes[mapId]) this.votes[mapId]=[];
    if(!this.votes[mapId].includes(user)) this.votes[mapId].push(user);
  }
  getResults() {
    return Object.entries(this.votes).map(([mapId,users])=>({mapId,votes:users.length}));
  }
}
window.MapVoting = MapVoting;
