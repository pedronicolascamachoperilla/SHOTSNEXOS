// loot_zones.js
// Lógica para zonas de reabastecimiento o botines
export class LootZone {
  constructor(config) {
    this.position = config.position;
    this.radius = config.radius || 60;
    this.items = config.items || [];
    this.cooldown = config.cooldown || 30; // segundos
    this.lastLooted = 0;
  }
  canLoot(now) {
    return (now - this.lastLooted) > this.cooldown;
  }
  loot(now) {
    if (this.canLoot(now)) {
      this.lastLooted = now;
      return this.items;
    }
    return [];
  }
  respawnItems(itemPool) {
    // Rellena la zona con nuevos ítems según rareza
    this.items = itemPool.filter(item => Math.random() < (item.rarity || 1));
  }
  isPlayerInZone(player) {
    const dx = player.x - this.position.x, dy = player.y - this.position.y;
    return Math.sqrt(dx*dx+dy*dy) <= this.radius;
  }
  onEnter(player) {
    // Evento: jugador entra a la zona de loot
    // Puedes disparar efectos, sonidos, etc.
  }
}
