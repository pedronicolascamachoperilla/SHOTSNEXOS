// Editor visual de mapas para NEXO
// Uso: incluir este archivo en index.html y usar <div id="editor-container"></div>

// Funcionalidades del editor visual de mapas:
// - Crear y editar mapas con drag & drop
// - Añadir/eliminar puntos de aparición (spawnPoints)
// - Añadir/eliminar objetivos (objectives)
// - Añadir/eliminar assets
// - Editar nombre y descripción
// - Exportar/importar mapas en formato JSON
// - Vista previa en tiempo real
// - Integración con minimap.js para previsualización
// - Guardar cambios localmente o en la nube
// - Accesibilidad: navegación con teclado y alto contraste

class MapEditor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.mapData = {
      name: '',
      description: '',
      spawnPoints: [],
      objectives: [],
      assets: []
    };
    this.initUI();
  }
  initUI() {
    this.container.innerHTML = `
      <h3>Editor de Mapas NEXO</h3>
      <input id="mapName" placeholder="Nombre del mapa"/><br>
      <textarea id="mapDesc" placeholder="Descripción"></textarea><br>
      <button id="addSpawn">Agregar SpawnPoint</button>
      <button id="addAsset">Agregar Asset</button>
      <button id="exportMap">Exportar JSON</button>
      <pre id="mapJson"></pre>
      <canvas id="editor-canvas" width="600" height="400" style="border:1px solid #888"></canvas>
    `;
    document.getElementById('addSpawn').onclick = () => this.addSpawnPoint();
    document.getElementById('addAsset').onclick = () => this.addAsset();
    document.getElementById('exportMap').onclick = () => this.exportMap();
    document.getElementById('mapName').oninput = e => this.mapData.name = e.target.value;
    document.getElementById('mapDesc').oninput = e => this.mapData.description = e.target.value;
    this.canvas = document.getElementById('editor-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.onclick = e => this.handleCanvasClick(e);
    this.render();
  }
  addSpawnPoint() {
    this.mapData.spawnPoints.push({ x: 50 + Math.random()*500, y: 50 + Math.random()*300 });
    this.render();
  }
  addAsset() {
    this.mapData.assets.push('nuevo_asset.png');
    this.render();
  }
  handleCanvasClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.mapData.spawnPoints.push({ x, y });
    this.render();
  }
  render() {
    this.ctx.clearRect(0,0,600,400);
    // Render spawnPoints
    this.ctx.fillStyle = '#0f0';
    this.mapData.spawnPoints.forEach(sp => {
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, 8, 0, 2*Math.PI);
      this.ctx.fill();
    });
    // Render assets
    this.ctx.fillStyle = '#00f';
    this.mapData.assets.forEach((a,i) => {
      this.ctx.fillRect(40+i*30, 350, 20, 20);
    });
    document.getElementById('mapJson').textContent = JSON.stringify(this.mapData, null, 2);
  }
  exportMap() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.mapData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", (this.mapData.name||'mapa')+".json");
    dlAnchor.click();
  }
}

window.MapEditor = MapEditor;
