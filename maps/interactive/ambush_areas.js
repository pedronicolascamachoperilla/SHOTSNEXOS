// ambush_areas.js
// Lógica para áreas de emboscada
export class AmbushArea {
  constructor(config) {
    this.area = config.area; // {x, y, width, height}
    this.triggers = config.triggers || [];
  }
  isPlayerInside(player) {
    const {x, y, width, height} = this.area;
    return player.x >= x && player.x <= x+width && player.y >= y && player.y <= y+height;
  }
  canTrigger(player, now) {
    // Ejemplo: cooldown por jugador
    if (!this._lastTrigger) this._lastTrigger = {};
    if (!this._lastTrigger[player.id] || (now - this._lastTrigger[player.id]) > 10) {
      this._lastTrigger[player.id] = now;
      return true;
    }
    return false;
  }
  trigger(player, now) {
    if (this.canTrigger(player, now)) {
      this.triggers.forEach(fn => fn(player));
    }
  }
  getPlayersInside(players) {
    return players.filter(p => this.isPlayerInside(p));
  }
}
