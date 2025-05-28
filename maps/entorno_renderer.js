// Funciones para renderizar y manipular el entorno de combate en el frontend del juego NEXO
// Uso: importar y usar con los datos de diseno_entornos.json

class EntornoRenderer {
  constructor(mapData, ctx) {
    this.mapData = mapData;
    this.ctx = ctx;
  }

  renderAll() {
    this.renderZones();
    this.renderCoverPoints();
    this.renderHighGround();
    this.renderRiskRewardZones();
    this.renderLandmarks();
  }

  renderZones() {
    (this.mapData.zones||[]).forEach(zone => {
      this._drawRect(zone.x, zone.y, zone.width, zone.height, this._colorForZone(zone.type), 0.18);
    });
  }

  renderCoverPoints() {
    (this.mapData.coverPoints||[]).forEach(cov => {
      this._drawRect(cov.x, cov.y, cov.width, cov.height, this._colorForCover(cov.type), 0.7);
    });
  }

  renderHighGround() {
    (this.mapData.highGround||[]).forEach(hg => {
      this._drawRect(hg.x, hg.y, hg.width, hg.height, this._colorForHighGround(hg.type), 0.5);
    });
  }

  renderRiskRewardZones() {
    (this.mapData.riskRewardZones||[]).forEach(rz => {
      this._drawRect(rz.x, rz.y, rz.width, rz.height, '#ff2222', 0.4);
    });
  }

  renderLandmarks() {
    (this.mapData.landmarks||[]).forEach(lm => {
      this._drawCircle(lm.x, lm.y, 18, this._colorForLandmark(lm.type), 0.8);
      this.ctx.save();
      this.ctx.globalAlpha = 1;
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px Arial';
      this.ctx.fillText(lm.description, lm.x+20, lm.y);
      this.ctx.restore();
    });
  }

  // Métodos auxiliares
  _drawRect(x, y, w, h, color, alpha) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
    this.ctx.restore();
  }
  _drawCircle(x, y, r, color, alpha) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2*Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.restore();
  }
  _colorForZone(type) {
    if(type==='espacio_abierto') return '#aaffaa';
    if(type==='pasillo_estrecho') return '#aaaaff';
    if(type==='estructura_vertical') return '#ffaaaa';
    return '#ccc';
  }
  _colorForCover(type) {
    if(type==='muro') return '#444';
    if(type==='caja') return '#b5651d';
    if(type==='auto_destruido') return '#222';
    if(type==='vegetacion_densa') return '#228833';
    return '#888';
  }
  _colorForHighGround(type) {
    if(type==='torre') return '#ffcc00';
    if(type==='balcon') return '#00ccff';
    if(type==='techo') return '#cccccc';
    return '#ff0';
  }
  _colorForLandmark(type) {
    if(type==='estatua') return '#e5e5e5';
    if(type==='fuente') return '#00eaff';
    if(type==='cartel') return '#ff00ff';
    return '#fff';
  }
}

if(typeof window!=='undefined') window.EntornoRenderer = EntornoRenderer;
