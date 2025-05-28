// respawns.js
// Lógica para respawns balanceados en mapas (excepto battle royale)
export class RespawnManager {
  constructor(spawnPoints, mode = 'default') {
    this.spawnPoints = spawnPoints;
    this.mode = mode;
  }
  getBalancedRespawn(playerStates, options = {}) {
    // Evita respawn cerca de enemigos y prioriza zonas seguras
    const minDist = options.minDist || 150;
    const avoidTeams = options.avoidTeams || [];
    const safeSpawns = this.spawnPoints.filter(spawn =>
      !playerStates.some(p =>
        (avoidTeams.length === 0 || avoidTeams.includes(p.team)) && this._distance(p.position, spawn) < minDist
      )
    );
    if (safeSpawns.length > 0) {
      // Prioriza spawns menos usados
      return safeSpawns[Math.floor(Math.random()*safeSpawns.length)];
    }
    // Si no hay spawns seguros, elige el más lejano a los enemigos
    let maxDist = 0, best = this.spawnPoints[0];
    for (const spawn of this.spawnPoints) {
      const dist = Math.min(...playerStates.map(p => this._distance(p.position, spawn)));
      if (dist > maxDist) { maxDist = dist; best = spawn; }
    }
    return best;
  }
  _distance(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
  }
}
