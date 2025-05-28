// Lógica para puertas automáticas/manuales en mapas NEXO
class MapDoor {
  constructor({mode, position, size, state}) {
    this.mode = mode; // 'auto' o 'manual'
    this.position = position;
    this.size = size;
    this.state = state || 'closed';
  }
  open() { this.state = 'open'; }
  close() { this.state = 'closed'; }
  toggle() { this.state = this.state==='open'?'closed':'open'; }
  isOpen() { return this.state==='open'; }
}
window.MapDoor = MapDoor;
