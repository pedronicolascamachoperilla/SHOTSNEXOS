// Lógica para elementos destructibles en mapas NEXO
class MapDestructible {
  constructor({subtype, position, size, hp}) {
    this.subtype = subtype; // 'wall', 'window', 'box'
    this.position = position;
    this.size = size;
    this.hp = hp || 100;
  }
  damage(amount) {
    this.hp -= amount;
    if(this.hp <= 0) this.destroy();
  }
  destroy() {
    // Lógica de destrucción visual y física
    this.hp = 0;
  }
}
window.MapDestructible = MapDestructible;
