const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;

// --- SONIDO INMERSIVO Y EFECTOS ---
let shootSound, reloadSound, hitSound, music, directionalAudio;

// --- FPS rápido y brutal ---
let isFPS = true;
let cameraYaw = 0, cameraPitch = 0;
let pointerLocked = false;
let powers = { slowTime: false, regen: false, thermal: false };
let weaponMods = [];

// --- Vehículo aliado ---
let allyVehicle = null;
let onVehicleRoof = false;

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.audio('shoot', 'assets/sounds/shoot.wav');
    this.load.audio('reload', 'assets/sounds/reload.wav');
    this.load.audio('hit', 'assets/sounds/hit.wav');
    this.load.audio('combat_music', 'assets/sounds/combat_music.mp3');
    // Banda sonora y efectos adicionales
    this.load.audio('industrial_metal', 'assets/sounds/industrial_metal.mp3');
    this.load.audio('ambient_screams', 'assets/sounds/ambient_screams.wav');
    this.load.audio('mech_breath', 'assets/sounds/mech_breath.wav');
    this.load.audio('bone_crack', 'assets/sounds/bone_crack.wav');
    this.load.audio('metal_screech', 'assets/sounds/metal_screech.wav');
    this.load.audio('alien_roar', 'assets/sounds/alien_roar.wav');
    this.load.audio('circuit_scream', 'assets/sounds/circuit_scream.wav');
    this.load.image('blood_splatter', 'assets/blood_splatter.png');
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

function spawnGoreEffect(scene, x, y) {
    const blood = scene.add.particles('blood').createEmitter({
        x, y,
        speed: { min: -120, max: 120 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 900,
        quantity: 12,
        tint: [0x990000, 0x660033, 0x440022]
    });
    for (let i = 0; i < 3; i++) {
        let part = scene.add.sprite(x + Phaser.Math.Between(-12, 12), y + Phaser.Math.Between(-12, 12), 'gore_part_' + Phaser.Math.Between(0, 2));
        part.setScale(Phaser.Math.FloatBetween(0.7, 1.2));
        scene.tweens.add({
            targets: part,
            x: part.x + Phaser.Math.Between(-40, 40),
            y: part.y + Phaser.Math.Between(-40, 40),
            alpha: 0,
            duration: 1200,
            onComplete: () => part.destroy()
        });
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

// --- Poderes especiales ---
function activatePower(power) {
    if (power === 'slowTime') {
        powers.slowTime = true;
        game.time.slowMotion = 0.3;
        setTimeout(() => { powers.slowTime = false; game.time.slowMotion = 1; }, 4000);
    }
    if (power === 'regen') {
        powers.regen = true;
        let heal = setInterval(() => { player.health = Math.min(player.health+10, 100); }, 300);
        setTimeout(() => { clearInterval(heal); powers.regen = false; }, 3000);
    }
    if (power === 'thermal') {
        powers.thermal = true;
        player.setTint(0xff3300);
        setTimeout(() => { player.clearTint(); powers.thermal = false; }, 5000);
    }
}

function setupPowerControls(scene) {
    scene.input.keyboard.on('keydown-Y', () => activatePower('slowTime'));
    scene.input.keyboard.on('keydown-U', () => activatePower('regen'));
    scene.input.keyboard.on('keydown-I', () => activatePower('thermal'));
    scene.input.keyboard.on('keydown-ONE', () => addWeaponMod('alien_implant'));
    scene.input.keyboard.on('keydown-TWO', () => addWeaponMod('nanotech'));
    scene.input.keyboard.on('keydown-THREE', () => addWeaponMod('explosive_rounds'));
}

const oldCreateFPS = create;
create = function() {
    oldCreateFPS.call(this);
    enablePointerLock(this);
    setupPowerControls(this);
}

function create() {
    // Fondo del juego
    this.add.image(400, 300, 'background');

    // Jugador
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);

    // Controles del teclado
    cursors = this.input.keyboard.createCursorKeys();

    shootSound = this.sound.add('shoot', { volume: 0.5 });
    reloadSound = this.sound.add('reload', { volume: 0.4 });
    hitSound = this.sound.add('hit', { volume: 0.6 });
    music = this.sound.add('combat_music', { loop: true, volume: 0.25 });
    music.play();

    // Banda sonora principal
    metalMusic = this.sound.add('industrial_metal', { loop: true, volume: 0.35 });
    metalMusic.play();
    // Sonidos de fondo
    ambientScreams = this.sound.add('ambient_screams', { loop: true, volume: 0.18 });
    ambientScreams.play();
    mechBreath = this.sound.add('mech_breath', { loop: true, volume: 0.12 });
    mechBreath.play();
    // Efectos de ambiente aleatorios
    this.time.addEvent({ delay: 9000, callback: () => { boneCrack.play(); }, loop: true });
    this.time.addEvent({ delay: 12000, callback: () => { metalScreech.play(); }, loop: true });
    // Efecto sangre en pantalla al recibir daño
    player.on('damaged', () => {
        if (!bloodSplatterSprite) {
            bloodSplatterSprite = this.add.image(player.x, player.y, 'blood_splatter').setScrollFactor(0).setDepth(100).setAlpha(0.7);
            this.tweens.add({ targets: bloodSplatterSprite, alpha: 0, duration: 900, onComplete: () => bloodSplatterSprite.destroy() });
        }
    });
    // Rugido alienígena al aparecer bestia transdimensionada
    this.events.on('spawnEldritch', (x, y) => {
        alienRoar.play();
    });
    // Circuitos chillando al destruir drone corrupto
    this.events.on('destroyCorruptDrone', (x, y) => {
        circuitScream.play();
    });

    setGameEnvironment(this);

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

    renderLevel(this);
}

function update() {
    // Movimiento del jugador
    player.setVelocity(0);

    if (cursors.left.isDown) {
        player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
    }

    if (cursors.up.isDown) {
        player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
        player.setVelocityY(200);
    }
}

function shootWeapon() {
    // Lógica para disparar
    if (shootSound) shootSound.play();
}

function reloadWeapon() {
    // Lógica para recargar
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

// --- Vehículo aliado ---
function spawnAllyVehicle(scene, x, y) {
    allyVehicle = scene.physics.add.sprite(x, y, 'ally_vehicle');
    allyVehicle.setImmovable(true);
    allyVehicle.setData('isAllyVehicle', true);
    // Carrocería iridiscente/cromada
    let iridescent = scene.add.rectangle(x, y, 120, 40, 0xffffff, 0.18);
    iridescent.setDepth(allyVehicle.depth - 1);
    scene.tweens.add({
        targets: iridescent,
        fillAlpha: { from: 0.18, to: 0.38 },
        fillColor: { from: 0xffffff, to: 0x00eaff },
        duration: 1800,
        yoyo: true,
        repeat: -1
    });
    // Franjas LED azules/púrpuras
    let led1 = scene.add.rectangle(x - 40, y, 80, 4, 0x00eaff, 0.7);
    let led2 = scene.add.rectangle(x + 40, y, 80, 4, 0x8e44ad, 0.7);
    led1.setDepth(allyVehicle.depth + 1);
    led2.setDepth(allyVehicle.depth + 1);
    // Faros prisma
    let headlightL = scene.add.polygon(x - 50, y - 16, [0,0, 12,-8, 24,0], 0x00eaff, 0.8);
    let headlightR = scene.add.polygon(x + 50, y - 16, [0,0, -12,-8, -24,0], 0x8e44ad, 0.8);
    headlightL.setDepth(allyVehicle.depth + 2);
    headlightR.setDepth(allyVehicle.depth + 2);
    // Puertas animadas (ala de halcón/holográfica)
    let doorL = scene.add.rectangle(x - 60, y, 12, 32, 0xcccccc, 0.5);
    let doorR = scene.add.rectangle(x + 60, y, 12, 32, 0xcccccc, 0.5);
    doorL.setDepth(allyVehicle.depth + 1);
    doorR.setDepth(allyVehicle.depth + 1);
    scene.tweens.add({ targets: doorL, angle: { from: 0, to: -60 }, duration: 1200, yoyo: true, repeat: -1 });
    scene.tweens.add({ targets: doorR, angle: { from: 0, to: 60 }, duration: 1200, yoyo: true, repeat: -1 });
    // Llantas levitantes/magnéticas
    let wheels = [];
    for (let i = 0; i < 4; i++) {
        let wx = x + (i < 2 ? -36 : 36);
        let wy = y + (i % 2 === 0 ? 18 : -18);
        let wheel = scene.add.ellipse(wx, wy, 22, 22, 0x222222, 0.7);
        wheel.setDepth(allyVehicle.depth);
        scene.tweens.add({ targets: wheel, y: wy + Phaser.Math.Between(-6,6), duration: 900, yoyo: true, repeat: -1 });
        // Efecto de levitación
        scene.tweens.add({ targets: wheel, alpha: { from: 0.7, to: 0.4 }, duration: 700, yoyo: true, repeat: -1 });
        wheels.push(wheel);
    }
    // Vidrios oscuros con HUD
    let hudGlass = scene.add.rectangle(x, y - 10, 80, 18, 0x222244, 0.6);
    hudGlass.setDepth(allyVehicle.depth + 2);
    let hudText = scene.add.text(x - 30, y - 16, 'HUD', { font: '10px Arial', fill: '#00eaff', alpha: 0.7 });
    hudText.setDepth(allyVehicle.depth + 3);
    scene.tweens.add({ targets: hudText, alpha: { from: 0.7, to: 0.2 }, duration: 1200, yoyo: true, repeat: -1 });
    // Torretas biomecánicas
    allyVehicle.turrets = [];
    for (let i = 0; i < 2; i++) {
        let turret = scene.add.sprite(x + (i ? 40 : -40), y - 20, 'biomech_turret');
        turret.setDepth(1);
        allyVehicle.turrets.push(turret);
    }
    // Colisión con jugador para subir
    scene.physics.add.overlap(player, allyVehicle, () => {
        if (!onVehicleRoof && cursors.up.isDown) {
            player.x = allyVehicle.x;
            player.y = allyVehicle.y - 40;
            onVehicleRoof = true;
        }
    });
    // Bajar del techo
    scene.input.keyboard.on('keydown-SHIFT', () => {
        if (onVehicleRoof) {
            player.y = allyVehicle.y + 40;
            onVehicleRoof = false;
        }
    });
}

function getMaxVehicleSpeed(isUrban) {
    return isUrban ? 180 : 430;
}

// Modificar velocidad de vehículos aliados
function updateAllyVehicle(scene) {
    if (!allyVehicle) return;
    // Limitar velocidad máxima
    if (allyVehicle.body && allyVehicle.body.speed > getMaxVehicleSpeed(false)) {
        scene.physics.velocityFromRotation(allyVehicle.body.rotation, getMaxVehicleSpeed(false), allyVehicle.body.velocity);
    }
    // Disparo automático de torretas a enemigos cercanos (sin IA avanzada) y rotación suave
    let enemies = scene.physics.world.bodies.entries.filter(b => b.gameObject && b.gameObject.getData && b.gameObject.getData('isEnemy'));
    allyVehicle.turrets.forEach(turret => {
        // Solo automotores con capacidad de disparo
        if (!turret.canShoot && turret.canShoot !== undefined) return;
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
                    let tipX = turret.x + Math.cos(turret.rotation) * (turret.width ? turret.width/2 : 24);
                    let tipY = turret.y + Math.sin(turret.rotation) * (turret.width ? turret.width/2 : 24);
                    let bullet = scene.add.sprite(tipX, tipY, 'bullet');
                    bullet.rotation = turret.rotation;
                    scene.physics.add.existing(bullet);
                    scene.physics.velocityFromRotation(turret.rotation, 600, bullet.body.velocity);
                    setTimeout(() => bullet.destroy(), 800);
                    turret.lastShot = scene.time.now;
                }
            }
        }
    });
}

// --- Sistema de disparo de mochila cohete ---
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

// Limitar velocidad de montables
if (typeof mountables !== 'undefined') {
    mountables.forEach(obj => {
        obj.speed = Math.min(obj.speed, 430);
    });
}

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
