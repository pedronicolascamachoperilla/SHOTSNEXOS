// weapons.js
// Sistema avanzado de armas para shooter 2D multijugador

export class Weapon {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.type = config.type; // pistol, rifle, shotgun, sniper, explosive, melee, etc.
    this.baseDamage = config.baseDamage;
    this.damageFalloff = config.damageFalloff || { start: 0, end: 1000, min: 0.5 };
    this.bodyMultipliers = config.bodyMultipliers || { head: 2, torso: 1, limb: 0.7 };
    this.fireMode = config.fireMode || 'semi'; // auto, semi, burst
    this.fireRate = config.fireRate || 600; // RPM
    this.spread = config.spread || { hip: 5, ads: 2, move: 8, crouch: 3 };
    this.recoil = config.recoil || { pattern: [0,1,-1,2,-2], force: 1 };
    this.penetration = config.penetration || 0; // mm
    this.ads = config.ads || { zoom: 1.2, reticle: 'dot' };
    this.attachments = config.attachments || [];
    this.skins = config.skins || [];
    this.magazine = config.magazine || { type: 'normal', capacity: 30 };
    this.reload = config.reload || { type: 'manual', speed: 2.5 };
    this.ammoType = config.ammoType || 'normal';
    this.sound = config.sound || { shot: 'shot.wav', reload: 'reload.wav', volume: 1 };
    this.heat = config.heat || { enabled: false, max: 100, perShot: 0, cooldown: 0 };
    this.effects = config.effects || { muzzle: 'flash', impact: 'spark' };
    this.weight = config.weight || 1;
    this.dualWield = config.dualWield || false;
    this.throwable = config.throwable || false;
    this.melee = config.melee || false;
    this.uniqueAbility = config.uniqueAbility || null;
    this.altFire = config.altFire || null;
    this.evolution = config.evolution || null;
  }

  getDamage(distance, hitZone = 'torso') {
    // Daño base con caída por distancia y multiplicador por zona
    let falloff = 1;
    if (distance > this.damageFalloff.start) {
      const t = Math.min(1, (distance-this.damageFalloff.start)/(this.damageFalloff.end-this.damageFalloff.start));
      falloff = 1 - t*(1-this.damageFalloff.min);
    }
    return Math.round(this.baseDamage * falloff * (this.bodyMultipliers[hitZone]||1));
  }

  getSpread(state = 'hip') {
    return this.spread[state] || this.spread.hip;
  }

  getRecoilPattern() {
    return this.recoil.pattern;
  }

  canPenetrate(material) {
    return material.thickness <= this.penetration;
  }

  getADS() {
    return this.ads;
  }

  getFireRate() {
    return this.fireRate;
  }
  getFireMode() {
    return this.fireMode;
  }
  getAccuracy(state = 'hip') {
    // Precisión inversa a spread
    return 100 - this.getSpread(state);
  }
  getRecoilForce() {
    return this.recoil.force;
  }
  getReticle() {
    return this.ads.reticle;
  }
  getZoom() {
    return this.ads.zoom;
  }
  getMagazineCapacity() {
    return this.magazine.capacity;
  }
  getReloadSpeed() {
    return this.reload.speed;
  }
  getAmmoType() {
    return this.ammoType;
  }
  getWeight() {
    return this.weight;
  }
  isDualWield() {
    return this.dualWield;
  }
  isThrowable() {
    return this.throwable;
  }
  isMelee() {
    return this.melee;
  }
  getSkinList() {
    return this.skins;
  }
  setSkin(skin) {
    if(this.skins.includes(skin)) this.currentSkin = skin;
  }
  getCurrentSkin() {
    return this.currentSkin || this.skins[0] || null;
  }
  getStats() {
    // Devuelve todas las estadísticas relevantes
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      baseDamage: this.baseDamage,
      fireRate: this.fireRate,
      fireMode: this.fireMode,
      spread: this.spread,
      recoil: this.recoil,
      penetration: this.penetration,
      magazine: this.magazine,
      reload: this.reload,
      ammoType: this.ammoType,
      weight: this.weight,
      dualWield: this.dualWield,
      throwable: this.throwable,
      melee: this.melee,
      skins: this.skins,
      attachments: this.attachments,
      ads: this.ads,
      heat: this.heat,
      effects: this.effects,
      uniqueAbility: this.uniqueAbility,
      altFire: this.altFire,
      evolution: this.evolution
    };
  }
  getTTK(targetHP = 100, distance = 0, hitZone = 'torso') {
    // Tiempo para matar (en segundos)
    const dmg = this.getDamage(distance, hitZone);
    const shots = Math.ceil(targetHP / dmg);
    return ((shots-1) * (60/this.fireRate));
  }
  getEffectiveRange() {
    // Devuelve el rango donde el daño es >= 80% del base
    const { start, end, min } = this.damageFalloff;
    if(min >= 0.8) return end;
    return start + (end-start)*(1-(0.8-min)/(1-min));
  }
  getRaiseTime() {
    // Tiempo de levantamiento (cambio de arma)
    return this.weight * 0.3 + 0.2;
  }
  getLowerTime() {
    // Tiempo de guardado
    return this.weight * 0.2 + 0.1;
  }
  getSoundProfile() {
    return this.sound;
  }
  isSoundDetectable() {
    return this.sound.volume > 0.2;
  }
  getHeatLevel() {
    return this.heat.enabled ? this.heat : null;
  }
  getMuzzleEffect() {
    return this.effects.muzzle;
  }
  getImpactEffect() {
    return this.effects.impact;
  }
  getAltFire() {
    return this.altFire;
  }
  getUniqueAbility() {
    return this.uniqueAbility;
  }
  evolve() {
    if(this.evolution) {
      // Lógica de evolución/mejora progresiva
      // ...
    }
  }

  getAttachmentStats() {
    // Devuelve stats modificadas por accesorios
    let stats = {...this};
    this.attachments.forEach(att => {
      if(att.modify) stats = att.modify(stats);
    });
    return stats;
  }

  reloadWeapon() {
    // Lógica de recarga (puede ser animación, callback, etc.)
    // ...
  }

  playSound(event) {
    // Reproduce sonido según evento (shot, reload, etc.)
    // ...
  }

  applyHeat() {
    if(this.heat.enabled) {
      // ...
    }
  }

  useAltFire() {
    if(this.altFire) {
      // ...
    }
  }

  useUniqueAbility() {
    if(this.uniqueAbility) {
      // ...
    }
  }
}
