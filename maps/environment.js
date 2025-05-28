// Lógica para renderizar y gestionar entornos avanzados en mapas NEXO
// Este módulo permite cargar, renderizar y consultar zonas de combate, coberturas, puntos elevados, zonas de riesgo y landmarks.

class MapEnvironment {
  constructor(mapData, scene) {
    this.mapData = mapData;
    this.scene = scene; // Puede ser un contexto Phaser o canvas
  }

  renderZones() {
    (this.mapData.zones||[]).forEach(zone => {
      // Renderiza zonas de combate
      // Ejemplo: color según tipo
      let color = '#ccc';
      if(zone.type==='espacio_abierto') color = '#aaffaa';
      if(zone.type==='pasillo_estrecho') color = '#aaaaff';
      if(zone.type==='estructura_vertical') color = '#ffaaaa';
      this._drawRect(zone.x, zone.y, zone.width, zone.height, color, 0.2);
    });
  }

  renderCoverPoints() {
    (this.mapData.coverPoints||[]).forEach(cov => {
      let color = '#888';
      if(cov.type==='muro') color = '#444';
      if(cov.type==='caja') color = '#b5651d';
      if(cov.type==='auto_destruido') color = '#222';
      if(cov.type==='vegetacion_densa') color = '#228833';
      this._drawRect(cov.x, cov.y, cov.width, cov.height, color, 0.7);
    });
  }

  renderHighGround() {
    (this.mapData.highGround||[]).forEach(hg => {
      let color = '#ff0';
      if(hg.type==='torre') color = '#ffcc00';
      if(hg.type==='balcon') color = '#00ccff';
      if(hg.type==='techo') color = '#cccccc';
      this._drawRect(hg.x, hg.y, hg.width, hg.height, color, 0.5);
    });
  }

  renderRiskRewardZones() {
    (this.mapData.riskRewardZones||[]).forEach(rz => {
      let color = rz.exposed ? '#ff2222' : '#22ff22';
      this._drawRect(rz.x, rz.y, rz.width, rz.height, color, 0.4);
    });
  }

  renderLandmarks() {
    (this.mapData.landmarks||[]).forEach(lm => {
      let color = '#fff';
      if(lm.type==='estatua') color = '#e5e5e5';
      if(lm.type==='fuente') color = '#00eaff';
      if(lm.type==='cartel') color = '#ff00ff';
      this._drawCircle(lm.x, lm.y, 18, color, 0.8);
    });
  }

  renderAll() {
    this.renderZones();
    this.renderCoverPoints();
    this.renderHighGround();
    this.renderRiskRewardZones();
    this.renderLandmarks();
  }

  // Métodos auxiliares para dibujar (canvas 2D)
  _drawRect(x, y, w, h, color, alpha) {
    if(this.scene && this.scene.fillStyle) {
      this.scene.save();
      this.scene.globalAlpha = alpha;
      this.scene.fillStyle = color;
      this.scene.fillRect(x, y, w, h);
      this.scene.restore();
    }
  }
  _drawCircle(x, y, r, color, alpha) {
    if(this.scene && this.scene.beginPath) {
      this.scene.save();
      this.scene.globalAlpha = alpha;
      this.scene.beginPath();
      this.scene.arc(x, y, r, 0, 2*Math.PI);
      this.scene.fillStyle = color;
      this.scene.fill();
      this.scene.restore();
    }
  }
}

if(typeof window!=='undefined') window.MapEnvironment = MapEnvironment;
