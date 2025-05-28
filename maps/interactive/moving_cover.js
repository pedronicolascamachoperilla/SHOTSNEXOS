// Lógica para cobertura móvil: trenes, vehículos, compuertas en mapas NEXO
class MapMovingCover {
  constructor({subtype, path, speed}) {
    this.subtype = subtype; // 'train', 'vehicle', 'gate'
    this.path = path;
    this.speed = speed || 3;
    this.currentIndex = 0;
    this.position = {...path[0]};
  }
  moveNext() {
    if(this.currentIndex < this.path.length-1) {
      this.currentIndex++;
      this.position = {...this.path[this.currentIndex]};
    }
  }
  movePrev() {
    if(this.currentIndex > 0) {
      this.currentIndex--;
      this.position = {...this.path[this.currentIndex]};
    }
  }
}
window.MapMovingCover = MapMovingCover;
