// Lógica para objetos activables: switches, trampas, alarmas en mapas NEXO
class MapSwitch {
  constructor({position, target}) {
    this.position = position;
    this.target = target;
    this.activated = false;
  }
  activate() { this.activated = true; }
  deactivate() { this.activated = false; }
}
class MapTrap {
  constructor({position, effect}) {
    this.position = position;
    this.effect = effect;
    this.activated = false;
  }
  trigger() { this.activated = true; }
}
class MapAlarm {
  constructor({position, radius}) {
    this.position = position;
    this.radius = radius;
    this.active = false;
  }
  activate() { this.active = true; }
  deactivate() { this.active = false; }
}
window.MapSwitch = MapSwitch;
window.MapTrap = MapTrap;
window.MapAlarm = MapAlarm;
