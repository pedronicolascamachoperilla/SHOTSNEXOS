// Lógica para ascensores, tirolinas y escaleras en mapas NEXO
class MapElevator {
  constructor({start, end, speed}) {
    this.start = start;
    this.end = end;
    this.speed = speed || 2;
    this.position = {...start};
  }
  moveToEnd() { this.position = {...this.end}; }
  moveToStart() { this.position = {...this.start}; }
}
class MapZipline {
  constructor({start, end}) {
    this.start = start;
    this.end = end;
  }
}
class MapLadder {
  constructor({position, height}) {
    this.position = position;
    this.height = height;
  }
}
window.MapElevator = MapElevator;
window.MapZipline = MapZipline;
window.MapLadder = MapLadder;
