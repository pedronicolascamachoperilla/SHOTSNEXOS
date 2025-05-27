// --- Diseño de Niveles: zonas, rutas y verticalidad ---
const levelData = {
    openZones: [
        { x: 100, y: 100, width: 300, height: 200 },
        { x: 500, y: 350, width: 200, height: 150 }
    ],
    coverZones: [
        { x: 250, y: 250, width: 80, height: 40 },
        { x: 600, y: 200, width: 60, height: 60 }
    ],
    platforms: [
        { x: 200, y: 400, width: 180, height: 20 },
        { x: 400, y: 200, width: 120, height: 20 }
    ],
    altRoutes: [
        { from: { x: 100, y: 100 }, to: { x: 700, y: 500 } }
    ],
    roads: [
        { x: 50, y: 550, width: 700, height: 30 },
        { x: 300, y: 100, width: 200, height: 20 }
    ],
    bridges: [
        { x: 350, y: 300, width: 120, height: 18 }
    ],
    trainTracks: [
        { x: 100, y: 500, width: 600, height: 10 },
        { x: 200, y: 400, width: 300, height: 10 }
    ],
    runways: [
        { x: 600, y: 80, width: 180, height: 24, type: 'avion' },
        { x: 80, y: 420, width: 120, height: 24, type: 'helicoptero' }
    ],
    buildings: [
        { x: 150, y: 150, width: 80, height: 120 },
        { x: 600, y: 100, width: 100, height: 180 }
    ],
    hills: [
        { x: 300, y: 300, radius: 60 },
        { x: 700, y: 400, radius: 40 }
    ],
};

function renderLevel(scene) {
    // Zonas abiertas (opcional: solo visual)
    levelData.openZones.forEach(zone => {
        scene.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x00ff00, 0.08).setOrigin(0);
    });
    // Zonas de cobertura
    levelData.coverZones.forEach(zone => {
        const cover = scene.add.rectangle(zone.x, zone.y, zone.width, zone.height, 0x444444, 0.5).setOrigin(0);
        scene.physics.add.existing(cover, true);
        scene.physics.add.collider(player, cover);
    });
    // Plataformas (verticalidad)
    levelData.platforms.forEach(plat => {
        const platform = scene.add.rectangle(plat.x, plat.y, plat.width, plat.height, 0x8888ff, 0.7).setOrigin(0);
        scene.physics.add.existing(platform, true);
        scene.physics.add.collider(player, platform);
    });
    // Rutas alternativas (visual)
    levelData.altRoutes.forEach(route => {
        scene.add.line(0, 0, route.from.x, route.from.y, route.to.x, route.to.y, 0xffff00, 0.3).setLineWidth(4);
    });
    // Carreteras
    if (levelData.roads) {
        levelData.roads.forEach(road => {
            const roadRect = scene.add.rectangle(road.x, road.y, road.width, road.height, 0x333333, 0.5).setOrigin(0);
            scene.physics.add.existing(roadRect, true);
            scene.physics.add.collider(player, roadRect);
            if (typeof mountableGroup !== 'undefined') {
                scene.physics.add.collider(mountableGroup, roadRect);
            }
        });
    }
    // Puentes
    if (levelData.bridges) {
        levelData.bridges.forEach(bridge => {
            const bridgeRect = scene.add.rectangle(bridge.x, bridge.y, bridge.width, bridge.height, 0x996633, 0.7).setOrigin(0);
            scene.physics.add.existing(bridgeRect, true);
            scene.physics.add.collider(player, bridgeRect);
            if (typeof mountableGroup !== 'undefined') {
                scene.physics.add.collider(mountableGroup, bridgeRect);
            }
        });
    }
    // Vías y túneles de tren
    if (levelData.trainTracks) {
        levelData.trainTracks.forEach(track => {
            const trackRect = scene.add.rectangle(track.x, track.y, track.width, track.height, 0x555555, 0.7).setOrigin(0);
            scene.physics.add.existing(trackRect, true);
            scene.physics.add.collider(player, trackRect);
            if (typeof mountableGroup !== 'undefined') {
                scene.physics.add.collider(mountableGroup, trackRect);
            }
        });
    }
    // Pistas de aterrizaje
    if (levelData.runways) {
        levelData.runways.forEach(runway => {
            let color = runway.type === 'avion' ? 0xffffff : 0x00aaff;
            const runwayRect = scene.add.rectangle(runway.x, runway.y, runway.width, runway.height, color, 0.6).setOrigin(0);
            scene.physics.add.existing(runwayRect, true);
            scene.physics.add.collider(player, runwayRect);
            if (typeof mountableGroup !== 'undefined') {
                scene.physics.add.collider(mountableGroup, runwayRect);
            }
        });
    }
    // Edificios
    if (levelData.buildings) {
        levelData.buildings.forEach(building => {
            const buildingRect = scene.add.rectangle(building.x, building.y, building.width, building.height, 0x888888, 0.8).setOrigin(0);
            scene.physics.add.existing(buildingRect, true);
            scene.physics.add.collider(player, buildingRect);
            if (typeof mountableGroup !== 'undefined') {
                scene.physics.add.collider(mountableGroup, buildingRect);
            }
        });
    }
    // Colinas (solo visual)
    if (levelData.hills) {
        levelData.hills.forEach(hill => {
            scene.add.circle(hill.x, hill.y, hill.radius, 0x228833, 0.3);
        });
    }
}

// --- SONIDO INMERSIVO Y EFECTOS ---
let shootSound, reloadSound, hitSound, music, directionalAudio;

function preload() {
    this.load.audio('shoot', 'assets/sounds/shoot.wav');
    this.load.audio('reload', 'assets/sounds/reload.wav');
    this.load.audio('hit', 'assets/sounds/hit.wav');
    this.load.audio('combat_music', 'assets/sounds/combat_music.mp3');
    this.load.audio('industrial_metal', 'assets/sounds/industrial_metal.mp3');
    this.load.audio('ambient_screams', 'assets/sounds/ambient_screams.wav');
    this.load.audio('mech_breath', 'assets/sounds/mech_breath.wav');
    this.load.audio('bone_crack', 'assets/sounds/bone_crack.wav');
    this.load.audio('metal_screech', 'assets/sounds/metal_screech.wav');
    this.load.audio('alien_roar', 'assets/sounds/alien_roar.wav');
    this.load.audio('circuit_scream', 'assets/sounds/circuit_scream.wav');
    this.load.image('blood_splatter', 'assets/blood_splatter.png');
}

function create() {
    shootSound = this.sound.add('shoot', { volume: 0.5 });
    reloadSound = this.sound.add('reload', { volume: 0.4 });
    hitSound = this.sound.add('hit', { volume: 0.6 });
    music = this.sound.add('combat_music', { loop: true, volume: 0.25 });
    music.play();
    metalMusic = this.sound.add('industrial_metal', { loop: true, volume: 0.35 });
    metalMusic.play();
    ambientScreams = this.sound.add('ambient_screams', { loop: true, volume: 0.18 });
    ambientScreams.play();
    mechBreath = this.sound.add('mech_breath', { loop: true, volume: 0.12 });
    mechBreath.play();
    this.time.addEvent({ delay: 9000, callback: () => { boneCrack.play(); }, loop: true });
    this.time.addEvent({ delay: 12000, callback: () => { metalScreech.play(); }, loop: true });
    player.on('damaged', () => {
        if (!bloodSplatterSprite) {
            bloodSplatterSprite = this.add.image(player.x, player.y, 'blood_splatter').setScrollFactor(0).setDepth(100).setAlpha(0.7);
            this.tweens.add({ targets: bloodSplatterSprite, alpha: 0, duration: 900, onComplete: () => bloodSplatterSprite.destroy() });
        }
    });
    this.events.on('spawnEldritch', (x, y) => {
        alienRoar.play();
    });
    this.events.on('destroyCorruptDrone', (x, y) => {
        circuitScream.play();
    });
}

function shootWeapon() {
    if (shootSound) shootSound.play();
}

function reloadWeapon() {
    if (reloadSound) reloadSound.play();
}

// Sonido direccional para enemigos
function playDirectionalEnemySound(scene, enemyX, enemyY) {
    const dx = enemyX - player.x;
    const dy = enemyY - player.y;
    const angle = Math.atan2(dy, dx);
    const pan = Math.max(-1, Math.min(1, dx / 400));
    if (!directionalAudio) {
        directionalAudio = scene.sound.add('hit', { volume: 0.7, pan });
    } else {
        directionalAudio.setPan(pan);
    }
    directionalAudio.play();
}

// --- ESTÉTICA VISUAL Y AMBIENTE ---
function setGameEnvironment(scene) {
    scene.cameras.main.setBackgroundColor('#1a001a');
    const bg = scene.add.rectangle(400, 300, 800, 600, 0x1a001a, 1);
    bg.setDepth(-10);
    scene.add.rectangle(200, 100, 120, 20, 0xff00ff, 0.5).setDepth(-9);
    scene.add.rectangle(600, 500, 80, 18, 0x00ffff, 0.4).setDepth(-9);
    scene.add.rectangle(400, 300, 200, 40, 0xff2222, 0.2).setDepth(-9);
    scene.add.rectangle(400, 300, 800, 600, 0x330033, 0.08).setDepth(-8);
}

// --- AMBIENTE OSCURO Y GROTESCO ---
function setGrotesqueEnvironment(scene) {
    scene.cameras.main.setBackgroundColor('#0a0010');
    const bg = scene.add.rectangle(400, 300, 800, 600, 0x0a0010, 1);
    bg.setDepth(-20);
    for (let i = 0; i < 4; i++) {
        let wall = scene.add.rectangle(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), Phaser.Math.Between(40, 120), Phaser.Math.Between(200, 400), 0x2d002d, 0.7);
        wall.setDepth(-19);
        let blood = scene.add.particles('blood').createEmitter({
            x: wall.x,
            y: wall.y + wall.height / 2,
            speedY: { min: 20, max: 60 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.7, end: 0 },
            lifespan: 900,
            quantity: 2,
            tint: [0x990000, 0x660033]
        });
    }
    for (let i = 0; i < 6; i++) {
        let led = scene.add.rectangle(Phaser.Math.Between(80, 720), Phaser.Math.Between(60, 540), 16, 8, Phaser.Display.Color.RandomRGB().color, 0.8);
        led.setDepth(-18);
        scene.tweens.add({
            targets: led,
            alpha: { from: 0.2, to: 1 },
            duration: Phaser.Math.Between(400, 1200),
            yoyo: true,
            repeat: -1
        });
    }
    let holo = scene.add.rectangle(400, 80, 180, 32, 0x00ffff, 0.18).setDepth(-17);
    scene.tweens.add({
        targets: holo,
        alpha: { from: 0.18, to: 0.05 },
        duration: 700,
        yoyo: true,
        repeat: -1
    });
    for (let i = 0; i < 3; i++) {
        let flesh = scene.add.rectangle(Phaser.Math.Between(100, 700), Phaser.Math.Between(400, 580), Phaser.Math.Between(80, 200), Phaser.Math.Between(20, 40), 0x7a0033, 0.5).setDepth(-16);
        let steel = scene.add.rectangle(flesh.x, flesh.y + 10, flesh.width, 8, 0xcccccc, 0.4).setDepth(-15);
    }
}

function animateBiomechWeapon(scene, weaponSprite) {
    scene.tweens.add({
        targets: weaponSprite,
        scaleX: { from: 1, to: 1.08 },
        scaleY: { from: 1, to: 0.95 },
        duration: 420,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function spawnGrotesqueEnemy(scene, x, y, typeIdx) {
    const type = enemyTypes[typeIdx % enemyTypes.length];
    let enemy = scene.physics.add.sprite(x, y, type.key);
    enemy.setTint(type.color);
    enemy.setScale(Phaser.Math.FloatBetween(1.1, 1.5));
    let flesh = scene.add.rectangle(enemy.x, enemy.y, 32, 18, 0xaa0033, 0.5);
    flesh.setDepth(1);
    let circuit = scene.add.rectangle(enemy.x, enemy.y + 10, 24, 6, 0x00ffff, 0.4);
    circuit.setDepth(1);
    scene.tweens.add({
        targets: circuit,
        alpha: { from: 0.4, to: 0.1 },
        duration: 600,
        yoyo: true,
        repeat: -1
    });
    enemy.on('killed', () => spawnGoreEffect(scene, enemy.x, enemy.y));
    return enemy;
}

function drawGrotesqueShipInterior(scene) {
    for (let i = 0; i < 2; i++) {
        let intestine = scene.add.ellipse(Phaser.Math.Between(120, 680), Phaser.Math.Between(120, 480), Phaser.Math.Between(120, 220), Phaser.Math.Between(30, 60), 0x7a0033, 0.25);
        intestine.setDepth(-14);
        let steel = scene.add.rectangle(intestine.x, intestine.y + 18, intestine.width, 10, 0xcccccc, 0.18).setDepth(-13);
    }
}

const enemyTypes = [
    { key: 'cyborg_mutant', name: 'Cyborg Mutado', color: 0x990099 },
    { key: 'infected_soldier', name: 'Soldado Infectado', color: 0x660000 },
    { key: 'biobeast', name: 'Bestia Bioingenierizada', color: 0x2222aa },
    { key: 'mech_human', name: 'Humano-Máquina', color: 0x444444 },
    // Nuevos tipos
    { key: 'lab_mutant', name: 'Mutante de Laboratorio', color: 0x8e44ad, fusion: true },
    { key: 'corrupt_drone', name: 'Drone Corrupto', color: 0x16a085, organic: true },
    { key: 'defective_clone', name: 'Clon Defectuoso', color: 0xec7063, cries: true },
    { key: 'eldritch_beast', name: 'Bestia Transdimensionada', color: 0x212f3c, grotesque: true }
];

function spawnEnemy(scene, x, y, typeIdx) {
    const type = enemyTypes[typeIdx % enemyTypes.length];
    let enemy = scene.physics.add.sprite(x, y, type.key);
    enemy.setTint(type.color);
    enemy.setScale(Phaser.Math.FloatBetween(1.1, 1.5));
    // Efectos únicos por tipo
    if (type.fusion) {
        let tech = scene.add.rectangle(enemy.x, enemy.y, 28, 8, 0xcccccc, 0.5);
        tech.setDepth(1);
    }
    if (type.organic) {
        scene.add.particles('blood').createEmitter({ x: enemy.x, y: enemy.y, speed: 20, scale: { start: 0.2, end: 0 }, lifespan: 600, quantity: 1, alpha: { start: 0.5, end: 0 } });
    }
    if (type.cries) {
        let cry = scene.add.text(enemy.x, enemy.y - 30, '¡Ayyy!', { font: '12px Arial', fill: '#fff' });
        scene.tweens.add({ targets: cry, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });
    }
    if (type.grotesque) {
        for (let i = 0; i < 4 + Math.floor(Math.random()*4); i++) {
            let limb = scene.add.rectangle(enemy.x + Phaser.Math.Between(-30,30), enemy.y + Phaser.Math.Between(-30,30), 8, 32, 0x212f3c, 0.5);
            limb.setAngle(Phaser.Math.Between(0,360));
            limb.setDepth(1);
        }
    }
    enemy.on('killed', () => spawnGoreEffect(scene, enemy.x, enemy.y));
    return enemy;
}

function spawnAllyVehicle(scene, x, y) {
    allyVehicle = scene.physics.add.sprite(x, y, 'ally_vehicle');
    allyVehicle.setData('isAllyVehicle', true);
    allyVehicle.turrets = [];
    for (let i = 0; i < 2; i++) {
        let turret = scene.add.sprite(x + (i ? 40 : -40), y - 20, 'biomech_turret');
        turret.setDepth(1);
        turret.canShoot = true;
        allyVehicle.turrets.push(turret);
    }
    scene.physics.add.overlap(player, allyVehicle, () => {
        player.x = allyVehicle.x;
        player.y = allyVehicle.y - 40;
        onVehicleRoof = true;
    });
}

let onVehicleRoof = false;

const oldCreateEnv = create;
create = function() {
    oldCreateEnv.call(this);
    setGameEnvironment(this);
};

// --- FPS rápido y brutal ---
let isFPS = true;
let cameraYaw = 0, cameraPitch = 0;
let pointerLocked = false;
let powers = { slowTime: false, regen: false, thermal: false };
let weaponMods = [];

function enablePointerLock(scene) {
    scene.input.mouse.requestPointerLock();
    scene.input.on('pointermove', function (pointer) {
        if (pointerLocked && isFPS) {
            cameraYaw += pointer.movementX * 0.002;
            cameraPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, cameraPitch + pointer.movementY * 0.002));
        }
    });
    scene.input.on('pointerlockchange', function () {
        pointerLocked = scene.input.mouse.locked;
    });
}

// --- Sistema de desmembramiento dinámico ---
function dynamicDismemberment(scene, enemy, hitPart) {
    spawnGoreEffect(scene, enemy.x, enemy.y);
    if (hitPart === 'head') {
        let head = scene.add.sprite(enemy.x, enemy.y - 20, 'gore_part_0');
        scene.tweens.add({ targets: head, y: head.y - 40, alpha: 0, duration: 800, onComplete: () => head.destroy() });
    } else if (hitPart === 'arm' || hitPart === 'leg') {
        let limb = scene.add.sprite(enemy.x + Phaser.Math.Between(-10,10), enemy.y + Phaser.Math.Between(-10,10), 'gore_part_1');
        scene.tweens.add({ targets: limb, x: limb.x + Phaser.Math.Between(-30,30), y: limb.y + Phaser.Math.Between(-30,30), alpha: 0, duration: 900, onComplete: () => limb.destroy() });
    } else {
        spawnGoreEffect(scene, enemy.x, enemy.y);
    }
    enemy.destroy();
}

// --- Armas modificables ---
function addWeaponMod(mod) {
    if (!weaponMods.includes(mod)) weaponMods.push(mod);
}
function removeWeaponMod(mod) {
    weaponMods = weaponMods.filter(m => m !== mod);
}
function getWeaponStatsWithMods(weaponId) {
    let base = getWeaponStats(weaponId);
    let stats = { ...base };
    weaponMods.forEach(mod => {
        if (mod === 'alien_implant') stats.precision += 0.05;
        if (mod === 'nanotech') stats.recoil -= 0.05;
        if (mod === 'explosive_rounds') stats.damage = (stats.damage||1)*1.5;
    });
    return stats;
}

// --- Lógica de torretas ---
function getTurretTarget(scene, turret, isAlly) {
    if (isAlly) {
        // Buscar enemigo más cercano
        let enemies = scene.physics.world.bodies.entries.filter(b => b.gameObject && b.gameObject.getData && b.gameObject.getData('isEnemy'));
        if (enemies.length === 0) return null;
        return enemies.sort((a, b) => Phaser.Math.Distance.Between(turret.x, turret.y, a.x, a.y) - Phaser.Math.Distance.Between(turret.x, turret.y, b.x, b.y))[0];
    } else {
        // Apuntar al jugador
        return player;
    }
}

function updateTurretLogic(scene, turret, isAlly) {
    let target = getTurretTarget(scene, turret, isAlly);
    if (target && Phaser.Math.Distance.Between(turret.x, turret.y, target.x, target.y) < 250) {
        // Apuntar visualmente (opcional: rotar sprite)
        // Disparo automático
        if (!turret.lastShot || scene.time.now - turret.lastShot > 900) {
            let bullet = scene.add.sprite(turret.x, turret.y, 'bullet');
            scene.physics.moveTo(bullet, target.x, target.y, 600);
            setTimeout(() => bullet.destroy(), 800);
            turret.lastShot = scene.time.now;
        }
    }
}
// En updateAllyVehicle y lógica de torretas enemigas, usar updateTurretLogic(scene, turret, true/false)

function updateAllyVehicle(scene) {
    if (!allyVehicle) return;
    // Limitar velocidad máxima si aplica
    if (allyVehicle.body && allyVehicle.body.speed > 400) {
        scene.physics.velocityFromRotation(allyVehicle.body.rotation, 400, allyVehicle.body.velocity);
    }
    // Disparo automático de torretas a enemigos cercanos y rotación suave
    let enemies = scene.physics.world.bodies.entries.filter(b => b.gameObject && b.gameObject.getData && b.gameObject.getData('isEnemy'));
    if (!allyVehicle.turrets) return;
    allyVehicle.turrets.forEach(turret => {
        if (!turret.canShoot) return; // Solo torretas con capacidad de disparo
        // Buscar enemigo más cercano
        let closest = enemies.sort((a, b) => Phaser.Math.Distance.Between(turret.x, turret.y, a.x, a.y) - Phaser.Math.Distance.Between(turret.x, turret.y, b.x, b.y))[0];
        if (closest && Phaser.Math.Distance.Between(turret.x, turret.y, closest.x, closest.y) < 250) {
            // Calcular ángulo objetivo
            let targetAngle = Phaser.Math.Angle.Between(turret.x, turret.y, closest.x, closest.y);
            if (turret.rotation === undefined) turret.rotation = 0;
            let delta = Phaser.Math.Angle.Wrap(targetAngle - turret.rotation);
            turret.rotation += Phaser.Math.Clamp(delta, -0.08, 0.08);
            // Disparo solo si está alineada (±0.25 rad)
            if (Math.abs(delta) < 0.25) {
                if (!turret.lastShot || scene.time.now - turret.lastShot > 900) {
                    // Calcular la punta de la torreta
                    let turretLength = turret.displayHeight ? turret.displayHeight/2 : 24;
                    let tipX = turret.x + Math.cos(turret.rotation) * turretLength;
                    let tipY = turret.y + Math.sin(turret.rotation) * turretLength;
                    let bullet = scene.physics.add.sprite(tipX, tipY, 'bullet');
                    bullet.rotation = turret.rotation;
                    scene.physics.velocityFromRotation(turret.rotation, 600, bullet.body.velocity);
                    setTimeout(() => bullet.destroy(), 800);
                    turret.lastShot = scene.time.now;
                }
            }
        }
    });
}

// --- DISPARO DE MOCHILA COHETE ---
function shootJetpack(scene, pointer) {
    let targetX = pointer.worldX !== undefined ? pointer.worldX : pointer.x;
    let targetY = pointer.worldY !== undefined ? pointer.worldY : pointer.y;
    let angle = Phaser.Math.Angle.Between(player.x, player.y, targetX, targetY);
    let offset = 24;
    let projX = player.x + Math.cos(angle) * offset;
    let projY = player.y + Math.sin(angle) * offset;
    let rocket = scene.physics.add.sprite(projX, projY, 'jetpack_rocket');
    rocket.rotation = angle;
    scene.physics.velocityFromRotation(angle, 700, rocket.body.velocity);
    setTimeout(() => rocket.destroy(), 1200);
    if (scene.sound) scene.sound.play('shoot');
}
scene.input.on('pointerdown', function(pointer) {
    if (pointer.rightButtonDown()) shootJetpack(scene, pointer);
});
if (scene.input.gamepad) {
    scene.input.gamepad.on('down', function(pad, button, index) {
        if (button.index === 1) {
            let stick = pad ? pad : { axes: [{ getValue:()=>0 }, { getValue:()=>0 }] };
            let dx = stick.axes[0].getValue();
            let dy = stick.axes[1].getValue();
            let angle = Math.atan2(dy, dx);
            if (dx !== 0 || dy !== 0) {
                let fakePointer = { x: player.x + dx*100, y: player.y + dy*100 };
                shootJetpack(scene, fakePointer);
            }
        }
    });
}

// --- INVENTARIO Y SISTEMA DE ARMAS ---
const weapons = [
    { id: 'knife', name: 'Cuchillo', damage: 10, range: 50, fireRate: 300, ammoType: 'none', description: 'Cuchillo de combate básico.' },
    { id: 'handgun', name: 'Pistola', damage: 25, range: 100, fireRate: 200, ammoType: '9mm', description: 'Pistola semiautomática de 9mm.' },
    { id: 'shotgun', name: 'Escopeta', damage: 40, range: 80, fireRate: 500, ammoType: '12ga', description: 'Escopeta de acción de bombeo.' },
    { id: 'rifle', name: 'Rifle de Asalto', damage: 35, range: 150, fireRate: 100, ammoType: '5.56mm', description: 'Rifle de asalto con alta cadencia de tiro.' },
    { id: 'sniper', name: 'Francotirador', damage: 75, range: 300, fireRate: 1500, ammoType: '7.62mm', description: 'Rifle de francotirador de largo alcance.' },
    { id: 'grenade', name: 'Granada', damage: 50, range: 10, fireRate: 1000, ammoType: 'none', description: 'Granada explosiva de mano.' },
    { id: 'flamethrower', name: 'Lanzallamas', damage: 20, range: 60, fireRate: 200, ammoType: 'none', description: 'Arma de fuego continuo que lanza llamas.' },
    { id: 'railgun', name: 'Railgun', damage: 100, range: 400, fireRate: 50, ammoType: 'none', description: 'Arma de energía que dispara proyectiles a alta velocidad.' },
    { id: 'plasma_rifle', name: 'Rifle de Plasma', damage: 60, range: 350, fireRate: 100, ammoType: 'none', description: 'Rifle que dispara ráfagas de plasma supercalentado.' },
    { id: 'katana', name: 'Katana', damage: 30, range: 50, fireRate: 400, ammoType: 'none', description: 'Espada japonesa tradicional, efectiva en combate cuerpo a cuerpo.' },
    { id: 'nunchaku', name: 'Nunchaku', damage: 20, range: 40, fireRate: 600, ammoType: 'none', description: 'Arma de dos palos conectados por una cadena, usada en artes marciales.' },
    { id: 'shuriken', name: 'Shuriken', damage: 15, range: 70, fireRate: 800, ammoType: 'none', description: 'Estrella ninja arrojadiza, efectiva a media distancia.' },
    { id: 'crossbow', name: 'Ballesta', damage: 35, range: 120, fireRate: 250, ammoType: 'bolts', description: 'Arma de proyectiles que usa tensión para disparar virotes.' },
    { id: 'machete', name: 'Machete', damage: 25, range: 60, fireRate: 500, ammoType: 'none', description: 'Cuchillo grande, útil para cortar y como arma.' },
    { id: 'crowbar', name: 'Palanca', damage: 20, range: 50, fireRate: 700, ammoType: 'none', description: 'Herramienta de acero, efectiva como arma improvisada.' },
    { id: 'katana_legendaria', name: 'Katana Legendaria', damage: 50, range: 55, fireRate: 350, ammoType: 'none', description: 'Katana de gran prestigio y poder.' }
];

// Katanas famosas
const famousKatanas = [
  {
    name: 'Masamune',
    type: 'katana',
    damage: 95,
    durability: 120,
    description: 'Katana legendaria forjada por Gorō Nyūdō Masamune. Filo, equilibrio y belleza excepcionales. Considerada la mejor espada japonesa de la historia.'
  },
  {
    name: 'Muramasa',
    type: 'katana',
    damage: 90,
    durability: 100,
    description: 'Forjada por Sengo Muramasa. Filo extremo y reputación “maldita”, asociada a tragedias y violencia.'
  },
  {
    name: 'Honjo Masamune',
    type: 'katana',
    damage: 98,
    durability: 130,
    description: 'Obra maestra de Masamune, símbolo del shogunato Tokugawa. Desaparecida tras la Segunda Guerra Mundial.'
  },
  {
    name: 'Kotetsu',
    type: 'katana',
    damage: 92,
    durability: 110,
    description: 'Katana de Nagasone Kotetsu, famosa por su dureza y capacidad de cortar armaduras.'
  },
  {
    name: 'Kogarasu Maru',
    type: 'tachi',
    damage: 88,
    durability: 105,
    description: 'Espada tachi de doble filo, transición entre tachi y katana, única en su tipo.'
  },
  {
    name: 'Hattori Hanzō',
    type: 'katana',
    damage: 93,
    durability: 115,
    description: 'Espada atribuida al legendario ninja y herrero Hattori Hanzō, símbolo de sigilo y precisión.'
  },
  {
    name: 'Tachi',
    type: 'tachi',
    damage: 85,
    durability: 100,
    description: 'Espada japonesa anterior a la katana, más curva y larga, usada por samuráis a caballo.'
  },
  {
    name: 'Naginata',
    type: 'naginata',
    damage: 80,
    durability: 90,
    description: 'Arma de asta con hoja curva, usada por samuráis y onna-bugeisha, excelente para combate a distancia.'
  }
];

// --- BLOCKCHAIN Y ALMACENAMIENTO ---
const inventory = {
    weapons: [],
    items: [],
    addWeapon(weaponId) {
        const weapon = weapons.find(w => w.id === weaponId);
        if (weapon && !this.weapons.includes(weapon)) {
            this.weapons.push(weapon);
            return true;
        }
        return false;
    },
    removeWeapon(weaponId) {
        this.weapons = this.weapons.filter(w => w.id !== weaponId);
    },
    addItem(itemId) {
        const item = items.find(i => i.id === itemId);
        if (item && !this.items.includes(item)) {
            this.items.push(item);
            return true;
        }
        return false;
    },
    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
    },
    clear() {
        this.weapons = [];
        this.items = [];
    }
};

// --- INTERFAZ Y MENÚ ---
function createInventoryUI(scene) {
    const { width, height } = scene.cameras.main;
    let background = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setOrigin(0.5);
    let title = scene.add.text(width / 2, height / 2 - 200, 'Inventario', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    let weaponTitle = scene.add.text(width / 2 - 100, height / 2 - 150, 'Armas', { fontSize: '24px', fill: '#ffff00' }).setOrigin(0.5);
    let itemTitle = scene.add.text(width / 2 + 100, height / 2 - 150, 'Objetos', { fontSize: '24px', fill: '#ffff00' }).setOrigin(0.5);
    let closeButton = scene.add.text(width - 70, height - 30, 'Cerrar', { fontSize: '18px', fill: '#ff0000' }).setOrigin(0.5).setInteractive();
    closeButton.on('pointerup', () => {
        background.destroy();
        title.destroy();
        weaponTitle.destroy();
        itemTitle.destroy();
        closeButton.destroy();
        weaponList.forEach(w => w.destroy());
        itemList.forEach(i => i.destroy());
    });
    let weaponList = [];
    let itemList = [];
    inventory.weapons.forEach((weapon, index) => {
        let y = height / 2 - 100 + index * 40;
        let weaponText = scene.add.text(width / 2 - 100, y, `${weapon.name} - Daño: ${weapon.damage}`, { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);
        weaponList.push(weaponText);
    });
    inventory.items.forEach((item, index) => {
        let y = height / 2 - 100 + index * 40;
        let itemText = scene.add.text(width / 2 + 100, y, item.name, { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);
        itemList.push(itemText);
    });
}

// --- MISIÓN Y OBJETIVOS ---
let currentMission = null;
let missionObjectives = [];

function startMission(scene, mission) {
    currentMission = mission;
    missionObjectives = mission.objectives.slice();
    scene.add.text(400, 50, `Misión: ${mission.name}`, { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5);
    updateMissionObjectives(scene);
}

function updateMissionObjectives(scene) {
    let objectivesText = 'Objetivos:\n';
    missionObjectives.forEach((obj, index) => {
        objectivesText += `${index + 1}. ${obj.description} ${obj.completed ? '(Completado)' : ''}\n`;
    });
    scene.add.text(400, 100, objectivesText, { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);
}

function completeObjective(index) {
    if (currentMission && missionObjectives[index]) {
        missionObjectives[index].completed = true;
        // Lógica adicional al completar un objetivo
    }
}

// --- GUARDADO Y CARGA ---
function saveGame() {
    const saveData = {
        player: {
            x: player.x,
            y: player.y,
            health: player.health,
            inventory: inventory.weapons.map(w => w.id),
            items: inventory.items.map(i => i.id),
        },
        mission: currentMission ? currentMission.name : null,
        objectives: missionObjectives,
    };
    localStorage.setItem('gameSave', JSON.stringify(saveData));
}

function loadGame() {
    const saveData = JSON.parse(localStorage.getItem('gameSave'));
    if (saveData) {
        player.x = saveData.player.x;
        player.y = saveData.player.y;
        player.health = saveData.player.health;
        inventory.clear();
        saveData.player.inventory.forEach(id => {
            const weapon = weapons.find(w => w.id === id);
            if (weapon) inventory.addWeapon(weapon.id);
        });
        saveData.player.items.forEach(id => {
            const item = items.find(i => i.id === id);
            if (item) inventory.addItem(item.id);
        });
        currentMission = saveData.mission ? missions.find(m => m.name === saveData.mission) : null;
        missionObjectives = saveData.objectives;
    }
}

// --- MENÚ PAUSA ---
function createPauseMenu(scene) {
    let menu = scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setOrigin(0.5);
    let title = scene.add.text(400, 100, 'Menú de Pausa', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    let resumeButton = scene.add.text(400, 250, 'Continuar', { fontSize: '24px', fill: '#00ff00' }).setOrigin(0.5).setInteractive();
    let restartButton = scene.add.text(400, 350, 'Reiniciar Nivel', { fontSize: '24px', fill: '#ffff00' }).setOrigin(0.5).setInteractive();
    let quitButton = scene.add.text(400, 450, 'Salir al Menú', { fontSize: '24px', fill: '#ff0000' }).setOrigin(0.5).setInteractive();

    resumeButton.on('pointerup', () => {
        menu.destroy();
        title.destroy();
        resumeButton.destroy();
        restartButton.destroy();
        quitButton.destroy();
    });
    restartButton.on('pointerup', () => {
        location.reload();
    });
    quitButton.on('pointerup', () => {
        // Lógica para salir al menú principal
    });
}

// --- MISIÓN Y NARRATIVA DINÁMICA ---
const missions = [
    {
        name: 'El Comienzo',
        objectives: [
            { description: 'Sobrevivir al ataque inicial.', completed: false },
            { description: 'Encontrar un arma.', completed: false },
            { description: 'Eliminar a los enemigos.', completed: false },
        ],
        onComplete: (scene) => {
            scene.add.text(400, 300, '¡Misión Completada: El Comienzo!', { fontSize: '28px', fill: '#00ff00' }).setOrigin(0.5);
            // Recompensas, desbloqueos, etc.
        }
    },
    {
        name: 'La Búsqueda',
        objectives: [
            { description: 'Buscar pistas sobre el paradero del objetivo.', completed: false },
            { description: 'Interrogar a un NPC.', completed: false },
            { description: 'Dirigirse al punto de encuentro.', completed: false },
        ],
        onComplete: (scene) => {
            scene.add.text(400, 300, '¡Misión Completada: La Búsqueda!', { fontSize: '28px', fill: '#00ff00' }).setOrigin(0.5);
            // Recompensas, desbloqueos, etc.
        }
    },
    {
        name: 'El Asalto',
        objectives: [
            { description: 'Infiltrarse en la base enemiga.', completed: false },
            { description: 'Desactivar la alarma.', completed: false },
            { description: 'Eliminar al comandante enemigo.', completed: false },
        ],
        onComplete: (scene) => {
            scene.add.text(400, 300, '¡Misión Completada: El Asalto!', { fontSize: '28px', fill: '#00ff00' }).setOrigin(0.5);
            // Recompensas, desbloqueos, etc.
        }
    }
];

// --- CÓDIGO PARA LA BLOCKCHAIN ---
async function connectToBlockchain() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Solicitar conexión a la billetera del usuario
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            console.log('Conectado a la blockchain con la cuenta:', await signer.getAddress());
            // Aquí puedes interactuar con contratos inteligentes, enviar transacciones, etc.
        } catch (error) {
            console.error('Error al conectar a la blockchain:', error);
        }
    } else {
        console.log('Por favor, instala MetaMask o una billetera compatible.');
    }
}

// --- INICIAR JUEGO ---
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function update() {
    // Lógica de actualización global
}

// --- Sistema de granadas ---
const grenades = [
  {
    id: 'frag9x',
    name: 'Frag-9X',
    type: 'explosiva',
    damage: 80,
    radius: 5,
    description: 'Granada de fragmentación estándar con núcleo mejorado para mayor alcance.',
    effect: 'Explota liberando metralla de alta velocidad en un radio de 5 metros.',
    mechanic: 'Daño físico elevado, buen control de área, no afecta a estructuras.'
  }
];

// --- INTERFAZ DE GRANADAS ---
function createGrenadeUI(scene) {
    const { width, height } = scene.cameras.main;
    let background = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8).setOrigin(0.5);
    let title = scene.add.text(width / 2, height / 2 - 200, 'Granadas', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    let closeButton = scene.add.text(width - 70, height - 30, 'Cerrar', { fontSize: '18px', fill: '#ff0000' }).setOrigin(0.5).setInteractive();
    closeButton.on('pointerup', () => {
        background.destroy();
        title.destroy();
        closeButton.destroy();
        grenadeList.forEach(g => g.destroy());
    });
    let grenadeList = [];
    grenades.forEach((grenade, index) => {
        let y = height / 2 - 100 + index * 60;
        let grenadeText = scene.add.text(width / 2, y, `${grenade.name} - Daño: ${grenade.damage}`, { fontSize: '18px', fill: '#ffffff' }).setOrigin(0.5);
        let descriptionText = scene.add.text(width / 2, y + 20, `${grenade.description}`, { fontSize: '14px', fill: '#ffff00' }).setOrigin(0.5);
        grenadeList.push(grenadeText);
        grenadeList.push(descriptionText);
    });
}

// --- USO DE GRANADAS ---
function throwGrenade(scene, grenadeId) {
    const grenade = grenades.find(g => g.id === grenadeId);
    if (!grenade) return;
    let grenadeSprite = scene.physics.add.sprite(player.x, player.y, 'grenade');
    scene.physics.velocityFromRotation(player.rotation, 500, grenadeSprite.body.velocity);
    grenadeSprite.setData('damage', grenade.damage);
    grenadeSprite.setData('radius', grenade.radius);
    setTimeout(() => {
        explodeGrenade(scene, grenadeSprite);
    }, 1500);
}

function explodeGrenade(scene, grenadeSprite) {
    const damage = grenadeSprite.getData('damage');
    const radius = grenadeSprite.getData('radius');
    scene.physics.world.bounds.width
    // Daño a enemigos en el radio de explosión
    scene.physics.world.bodies.entries.forEach(body => {
        if (body.gameObject && body.gameObject.getData && body.gameObject.getData('isEnemy')) {
            let enemy = body.gameObject;
            let dist = Phaser.Math.Distance.Between(grenadeSprite.x, grenadeSprite.y, enemy.x, enemy.y);
            if (dist <= radius) {
                enemy.emit('killed');
                // Efecto de explosión (partículas, sonido, etc.)
                spawnGoreEffect(scene, enemy.x, enemy.y);
            }
        }
    });
    // Destrucción de la granada
    grenadeSprite.destroy();
}

// --- MEJORAS Y MODIFICACIONES DE ARMAS ---
const weaponUpgrades = [
    { id: 'scope', name: 'Mira', description: 'Aumenta la precisión y el alcance.', stat: 'precision', value: 0.1 },
    { id: 'silencer', name: 'Silenciador', description: 'Reduce el ruido y oculta el destello.', stat: 'noise', value: -0.5 },
    { id: 'extended_mag', name: 'Cargador Ampliado', description: 'Aumenta la capacidad del cargador.', stat: 'ammoCapacity', value: 5 },
    { id: 'laser_sight', name: 'Luz Laser', description: 'Mejora la puntería en condiciones de poca luz.', stat: 'aimAssist', value: 0.2 },
    { id: 'grenade_launcher', name: 'Lanzagranadas', description: 'Permite disparar granadas de fragmentación.', stat: 'grenadeDamage', value: 20 }
];

// --- APLICAR MEJORAS A LAS ARMAS ---
function applyWeaponUpgrade(weaponId, upgradeId) {
    let weapon = weapons.find(w => w.id === weaponId);
    let upgrade = weaponUpgrades.find(u => u.id === upgradeId);
    if (weapon && upgrade) {
        weapon[upgrade.stat] = (weapon[upgrade.stat] || 0) + upgrade.value;
        // Efectos visuales y de sonido al aplicar la mejora
        // ...
    }
}

// --- ELIMINAR MEJORAS DE LAS ARMAS ---
function removeWeaponUpgrade(weaponId, upgradeId) {
    let weapon = weapons.find(w => w.id === weaponId);
    let upgrade = weaponUpgrades.find(u => u.id === upgradeId);
    if (weapon && upgrade) {
        weapon[upgrade.stat] = (weapon[upgrade.stat] || 0) - upgrade.value;
        // Efectos visuales y de sonido al eliminar la mejora
        // ...
    }
}