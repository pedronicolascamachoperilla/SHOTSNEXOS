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

// Soporte para elementos interactivos avanzados
class MapInteractiveEditor {
  constructor(mapData, canvas, ctx) {
    this.mapData = mapData;
    this.canvas = canvas;
    this.ctx = ctx;
    if (!this.mapData.interactiveObjects) this.mapData.interactiveObjects = [];
  }
  addDoor() {
    this.mapData.interactiveObjects.push({ type: 'door', mode: 'auto', position: { x: 100, y: 100 }, size: { width: 40, height: 100 }, state: 'closed' });
  }
  addElevator() {
    this.mapData.interactiveObjects.push({ type: 'elevator', start: { x: 100, y: 400 }, end: { x: 100, y: 100 }, speed: 2 });
  }
  addZipline() {
    this.mapData.interactiveObjects.push({ type: 'zipline', start: { x: 200, y: 100 }, end: { x: 600, y: 300 } });
  }
  addLadder() {
    this.mapData.interactiveObjects.push({ type: 'ladder', position: { x: 350, y: 250 }, height: 120 });
  }
  addDestructible() {
    this.mapData.interactiveObjects.push({ type: 'destructible', subtype: 'wall', position: { x: 500, y: 350 }, size: { width: 60, height: 20 }, hp: 100 });
  }
  addSwitch() {
    this.mapData.interactiveObjects.push({ type: 'switch', position: { x: 420, y: 180 }, target: 'door_1' });
  }
  addTrap() {
    this.mapData.interactiveObjects.push({ type: 'trap', position: { x: 600, y: 400 }, effect: 'spikes' });
  }
  addAlarm() {
    this.mapData.interactiveObjects.push({ type: 'alarm', position: { x: 100, y: 80 }, radius: 200 });
  }
  addMovingCover() {
    this.mapData.interactiveObjects.push({ type: 'moving_cover', subtype: 'train', path: [ { x: 100, y: 500 }, { x: 700, y: 500 } ], speed: 3 });
  }
  render() {
    // Render interactivos
    (this.mapData.interactiveObjects||[]).forEach(obj => {
      this.ctx.save();
      if(obj.type==='door') {
        this.ctx.strokeStyle = obj.state==='open' ? '#0f0' : '#f00';
        this.ctx.strokeRect(obj.position.x, obj.position.y, obj.size.width, obj.size.height);
      } else if(obj.type==='elevator') {
        this.ctx.strokeStyle = '#00f';
        this.ctx.beginPath();
        this.ctx.moveTo(obj.start.x, obj.start.y);
        this.ctx.lineTo(obj.end.x, obj.end.y);
        this.ctx.stroke();
      } else if(obj.type==='zipline') {
        this.ctx.strokeStyle = '#0ff';
        this.ctx.setLineDash([5,5]);
        this.ctx.beginPath();
        this.ctx.moveTo(obj.start.x, obj.start.y);
        this.ctx.lineTo(obj.end.x, obj.end.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
      } else if(obj.type==='ladder') {
        this.ctx.strokeStyle = '#964B00';
        this.ctx.beginPath();
        this.ctx.moveTo(obj.position.x, obj.position.y);
        this.ctx.lineTo(obj.position.x, obj.position.y+obj.height);
        this.ctx.stroke();
      } else if(obj.type==='destructible') {
        this.ctx.strokeStyle = '#888';
        this.ctx.strokeRect(obj.position.x, obj.position.y, obj.size.width, obj.size.height);
      } else if(obj.type==='switch') {
        this.ctx.fillStyle = '#ff0';
        this.ctx.fillRect(obj.position.x-5, obj.position.y-5, 10, 10);
      } else if(obj.type==='trap') {
        this.ctx.fillStyle = '#f0f';
        this.ctx.beginPath();
        this.ctx.arc(obj.position.x, obj.position.y, 8, 0, 2*Math.PI);
        this.ctx.fill();
      } else if(obj.type==='alarm') {
        this.ctx.strokeStyle = '#f90';
        this.ctx.beginPath();
        this.ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, 2*Math.PI);
        this.ctx.stroke();
      } else if(obj.type==='moving_cover') {
        this.ctx.strokeStyle = '#0a0';
        this.ctx.beginPath();
        for(let i=0;i<obj.path.length-1;i++){
          this.ctx.moveTo(obj.path[i].x, obj.path[i].y);
          this.ctx.lineTo(obj.path[i+1].x, obj.path[i+1].y);
        }
        this.ctx.stroke();
      }
      this.ctx.restore();
    });
  }
}

// Extiende el editor visual para incluir botones de elementos interactivos
const oldInitUI = MapEditor.prototype.initUI;
MapEditor.prototype.initUI = function() {
  oldInitUI.call(this);
  const btns = [
    {id:'addDoor',label:'Agregar Puerta',fn:()=>this.interactiveEditor.addDoor()},
    {id:'addElevator',label:'Agregar Ascensor',fn:()=>this.interactiveEditor.addElevator()},
    {id:'addZipline',label:'Agregar Tirolina',fn:()=>this.interactiveEditor.addZipline()},
    {id:'addLadder',label:'Agregar Escalera',fn:()=>this.interactiveEditor.addLadder()},
    {id:'addDestructible',label:'Agregar Destructible',fn:()=>this.interactiveEditor.addDestructible()},
    {id:'addSwitch',label:'Agregar Switch',fn:()=>this.interactiveEditor.addSwitch()},
    {id:'addTrap',label:'Agregar Trampa',fn:()=>this.interactiveEditor.addTrap()},
    {id:'addAlarm',label:'Agregar Alarma',fn:()=>this.interactiveEditor.addAlarm()},
    {id:'addMovingCover',label:'Agregar Cobertura Móvil',fn:()=>this.interactiveEditor.addMovingCover()}
  ];
  btns.forEach(b=>{
    const btn=document.createElement('button');
    btn.textContent=b.label;
    btn.onclick=b.fn;
    this.container.appendChild(btn);
  });
  this.interactiveEditor = new MapInteractiveEditor(this.mapData, this.canvas, this.ctx);
  // Redefinir render para incluir interactivos
  const oldRender = this.render.bind(this);
  this.render = () => {
    oldRender();
    this.interactiveEditor.render();
  };
};
