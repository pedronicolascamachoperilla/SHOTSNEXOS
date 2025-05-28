// control_points.js
// Lógica para puntos de control y objetivos (CTF, dominación, etc.)
export class ControlPoint {
  constructor(config) {
    this.id = config.id;
    this.position = config.position;
    this.radius = config.radius || 50;
    this.owner = config.owner || null;
    this.captureProgress = 0;
    this.captureTime = config.captureTime || 5; // segundos
    this.type = config.type || 'domination'; // 'ctf', 'domination', etc.
  }
  update(players, now) {
    // Soporte para CTF, dominación, bloqueo, etc.
    const inZone = players.filter(p => this._inZone(p));
    if (this.type === 'ctf') {
      // Lógica de captura de bandera
      inZone.forEach(p => {
        if (p.hasFlag && (!this.owner || this.owner !== p.team)) {
          this.owner = p.team;
          this.captureProgress = 0;
        }
      });
    } else if (this.type === 'domination') {
      if (inZone.length > 0) {
        const team = inZone[0].team;
        if (inZone.every(p => p.team === team)) {
          this.captureProgress += 1;
          if (this.captureProgress >= this.captureTime) {
            this.owner = team;
            this.captureProgress = 0;
          }
        } else {
          this.captureProgress = 0;
        }
      } else {
        this.captureProgress = 0;
      }
    }
    // Evento de captura
    if (this.owner && this.onCapture) this.onCapture(this.owner, now);
  }
  setOnCapture(cb) {
    this.onCapture = cb;
  }
  _inZone(player) {
    const dx = player.x - this.position.x, dy = player.y - this.position.y;
    return Math.sqrt(dx*dx+dy*dy) <= this.radius;
  }
}
