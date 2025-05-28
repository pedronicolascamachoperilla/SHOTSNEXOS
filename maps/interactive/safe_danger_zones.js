// safe_danger_zones.js
// Sistema de zonas seguras/peligrosas (battle royale)
export class ZoneManager {
  constructor(zones) {
    this.zones = zones; // [{type: 'safe'|'danger', area: {x,y,radius}}]
    this.currentIndex = 0;
  }
  getCurrentZone() {
    return this.zones[this.currentIndex];
  }
  advanceZone() {
    if (this.currentIndex < this.zones.length-1) {
      this.currentIndex++;
      if (this._onTransition) this._onTransition(this.getCurrentZone());
    }
  }
  isInSafeZone(player) {
    const zone = this.getCurrentZone();
    if (zone.type !== 'safe') return false;
    const dx = player.x-zone.area.x, dy = player.y-zone.area.y;
    return Math.sqrt(dx*dx+dy*dy) <= zone.area.radius;
  }
  applyZoneEffects(players, now) {
    // Aplica daño a jugadores fuera de la zona segura
    const zone = this.getCurrentZone();
    players.forEach(player => {
      const dx = player.x-zone.area.x, dy = player.y-zone.area.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (zone.type === 'safe' && dist > zone.area.radius) {
        player.hp -= (zone.damage || 1); // Daño configurable
      }
    });
  }
  shrinkZone(targetRadius, duration, now) {
    // Reduce el radio de la zona segura gradualmente
    const zone = this.getCurrentZone();
    if (!zone._shrinkStart) zone._shrinkStart = now;
    const elapsed = now - zone._shrinkStart;
    if (elapsed < duration) {
      zone.area.radius -= (zone.area.radius - targetRadius) * (elapsed/duration);
    } else {
      zone.area.radius = targetRadius;
    }
  }
  onZoneTransition(cb) {
    // Permite registrar eventos al cambiar de zona
    this._onTransition = cb;
  }
}
