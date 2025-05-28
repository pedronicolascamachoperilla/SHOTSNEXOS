// routes.js
// Lógica para rutas alternativas y flanqueo
export class Route {
  constructor(config) {
    this.path = config.path; // [{x,y}, ...]
    this.type = config.type || 'flank'; // 'flank', 'main', etc.
    this.blocked = config.blocked || false;
  }
  isPointOnRoute(point) {
    // Simple: verifica si el punto está cerca de algún segmento de la ruta
    return this.path.some(p => Math.abs(p.x-point.x)<20 && Math.abs(p.y-point.y)<20);
  }
  isBlocked() {
    return !!this.blocked;
  }
  unlock() {
    this.blocked = false;
    if (this.onUnlock) this.onUnlock();
  }
  setOnUnlock(cb) {
    this.onUnlock = cb;
  }
  getPath() {
    return this.path;
  }
  setBlocked(state = true) {
    this.blocked = state;
  }
  useRoute(player) {
    // Evento: jugador usa la ruta
    if (this.onUse) this.onUse(player);
  }
  setOnUse(cb) {
    this.onUse = cb;
  }
}
