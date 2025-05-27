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
let weaponSprite;
let weaponInfoText;
let skinInfoText;
let keys;
let skinIndex = 0;
let skinType = 'gears'; // 'gears' o 'halo'
const totalGearsSkins = 5;
const totalHaloSkins = 3;
const gearsSkinNames = ["Marcus", "Dom", "Cole", "Baird", "Anya"];
const haloSkinNames = ["Master Chief", "Spartan Locke", "Cortana"];
let shadow;
let particles;
let skinFlashTween;

let mountables = [
    { key: 'monstertruck', name: 'Monster Truck', speed: 400, price: 1000 },
    { key: 'sportscar', name: 'Sports Car', speed: 350, price: 800 },
    { key: 'jeep', name: 'Jeep', speed: 300, price: 600 },
    { key: 'motorbike', name: 'Motorbike', speed: 450, price: 900 },
    { key: 'rocket backpack', name: 'Rocket Backpack', speed: 500, price: 1200 },
    { key: 'parachute', name: 'Parachute', speed: 250, price: 400 },
    { key: 'ski board', name: 'Ski Board', speed: 320, price: 500 },
    { key: 'surfer board', name: 'Surfer Board', speed: 320, price: 500 },
    { key: 'snowmobile', name: 'Snowmobile', speed: 380, price: 700 },
    { key: 'tank car', name: 'Tank Car', speed: 200, price: 2000 },
    { key: 'turret tank', name: 'Turret Tank', speed: 180, price: 2500 }
];
let mountableGroup;
let currentMount = null;
let mountInfoText;

let isCrouching = false;
let isProne = false;
let isAiming = false;
let isJumping = false;
let jumpVelocity = -350;
let canJump = true;

// --- Tipos de armas y mecánicas de disparo ---
const weaponTypes = [
    { name: 'Pistola', precision: 0.92, recoil: 0.1, reloadTime: 800, fireRate: 400, ammo: 12 },
    { name: 'Rifle', precision: 0.85, recoil: 0.18, reloadTime: 1500, fireRate: 200, ammo: 30 },
    { name: 'Escopeta', precision: 0.7, recoil: 0.3, reloadTime: 2000, fireRate: 900, ammo: 6 },
    { name: 'SMG', precision: 0.8, recoil: 0.13, reloadTime: 1200, fireRate: 120, ammo: 25 }
];
let currentAmmo = 0;
let maxAmmo = 0;
let isReloading = false;
let lastShotTime = 0;

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
        // Puedes usar esto para rutas alternativas (por ejemplo, túneles o caminos elevados)
        { from: { x: 100, y: 100 }, to: { x: 700, y: 500 } }
    ],
    roads: [
        { x: 50, y: 550, width: 700, height: 30 }, // carretera principal
        { x: 300, y: 100, width: 200, height: 20 } // carretera secundaria
    ],
    bridges: [
        { x: 350, y: 300, width: 120, height: 18 } // puente
    ],
    trainTracks: [
        { x: 100, y: 500, width: 600, height: 10 }, // vía de tren
        { x: 200, y: 400, width: 300, height: 10 } // túnel de tren
    ],
    runways: [
        { x: 600, y: 80, width: 180, height: 24, type: 'avion' },
        { x: 80, y: 420, width: 120, height: 24, type: 'helicoptero' }
    ],
    // Edificios (verticalidad y cobertura)
    buildings: [
        { x: 150, y: 150, width: 80, height: 120 },
        { x: 600, y: 100, width: 100, height: 180 }
    ],
    // Colinas (verticalidad, solo visual)
    hills: [
        { x: 300, y: 300, radius: 60 },
        { x: 700, y: 400, radius: 40 }
    ],
};

function preload() {
    this.load.image('background', 'assets/background.png');
    // Carga trajes tipo Gears
    for (let i = 0; i < totalGearsSkins; i++) {
        this.load.spritesheet('gear_skin_' + i, 'assets/gear_skin_' + i + '.png', { frameWidth: 64, frameHeight: 64 });
    }
    // Carga trajes tipo Halo
    for (let i = 0; i < totalHaloSkins; i++) {
        this.load.spritesheet('halo_skin_' + i, 'assets/halo_skin_' + i + '.png', { frameWidth: 64, frameHeight: 64 });
    }
    this.load.image('bullet', 'assets/bullet.png');
    // Carga sprites de armas (ejemplo: arma_0.png, arma_1.png, ...)
    for (let i = 0; i < 10; i++) {
        this.load.image('arma_' + i, 'assets/arma_' + i + '.png');
    }
    // Cargar assets de objetos montables
    mountables.forEach(obj => {
        this.load.image(obj.key, 'assets/' + obj.key + '.png');
    });
    this.load.audio('shoot', 'assets/sounds/shoot.wav');
    this.load.audio('reload', 'assets/sounds/reload.wav');
    this.load.audio('hit', 'assets/sounds/hit.wav');
    this.load.audio('combat_music', 'assets/sounds/combat_music.mp3');
    // Cargar texturas para efectos gore
    this.load.image('blood', 'assets/blood.png');
    for (let i = 0; i < 3; i++) {
        this.load.image('gore_part_' + i, 'assets/gore_part_' + i + '.png');
    }
    // Cargar sprites para enemigos
    enemyTypes.forEach(enemy => {
        this.load.image(enemy.key, 'assets/enemies/' + enemy.key + '.png');
    });
    // Cargar vehículo aliado y torretas biomecánicas
    this.load.image('ally_vehicle', 'assets/ally_vehicle.png');
    this.load.image('biomech_turret', 'assets/biomech_turret.png');
}

function create() {
    // Fondo del juego
    this.add.image(400, 300, 'background');

    // Jugador
    player = this.physics.add.sprite(400, 300, 'gear_skin_0', 0);
    player.setCollideWorldBounds(true);

    // Controles del teclado
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys({
        nextWeapon: Phaser.Input.Keyboard.KeyCodes.E,
        prevWeapon: Phaser.Input.Keyboard.KeyCodes.Q,
        nextSkin: Phaser.Input.Keyboard.KeyCodes.T,
        toggleSkinType: Phaser.Input.Keyboard.KeyCodes.H,
        run: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        crouch: Phaser.Input.Keyboard.KeyCodes.CTRL,
        prone: Phaser.Input.Keyboard.KeyCodes.Z,
        proneAim: Phaser.Input.Keyboard.KeyCodes.X,
        jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
        aim: Phaser.Input.Keyboard.KeyCodes.ALT
    });

    // Mostrar el arma seleccionada
    weaponSprite = this.add.sprite(player.x, player.y, 'arma_0');
    weaponSprite.setDepth(1);

    // Texto de información del arma
    weaponInfoText = this.add.text(16, 16, '', { font: '18px Arial', fill: '#ffcc00' });
    weaponInfoText.setScrollFactor(0);

    // Texto de información del skin
    skinInfoText = this.add.text(600, 16, '', { font: '18px Arial', fill: '#00eaff' });
    skinInfoText.setScrollFactor(0);

    // Animaciones Gears
    for (let i = 0; i < totalGearsSkins; i++) {
        this.anims.create({
            key: 'gears_idle_' + i,
            frames: this.anims.generateFrameNumbers('gear_skin_' + i, { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'gears_run_' + i,
            frames: this.anims.generateFrameNumbers('gear_skin_' + i, { start: 4, end: 7 }),
            frameRate: 12,
            repeat: -1
        });
    }
    // Animaciones Halo
    for (let i = 0; i < totalHaloSkins; i++) {
        this.anims.create({
            key: 'halo_idle_' + i,
            frames: this.anims.generateFrameNumbers('halo_skin_' + i, { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'halo_run_' + i,
            frames: this.anims.generateFrameNumbers('halo_skin_' + i, { start: 4, end: 7 }),
            frameRate: 12,
            repeat: -1
        });
    }
    // Sombra bajo el jugador
    shadow = this.add.ellipse(player.x, player.y + 28, 48, 16, 0x000000, 0.4);
    shadow.setDepth(0);
    // Partículas al correr
    particles = this.add.particles('bullet');
    let emitter = particles.createEmitter({
        x: player.x, y: player.y,
        speed: { min: -20, max: 20 },
        angle: { min: 160, max: 200 },
        scale: { start: 0.2, end: 0 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 300,
        quantity: 0
    });
    particles.setDepth(0);
    // Sincronizar arma y traje inicial
    updateWeaponSprite.call(this);
    updateSkinSprite();
    updateSkinInfoText();

    // Crear grupo de objetos recogibles
    mountableGroup = this.physics.add.group();
    mountables.forEach((obj, idx) => {
        let x = 100 + idx * 80;
        let y = 500;
        let item = mountableGroup.create(x, y, obj.key);
        item.setData('mountable', obj);
        item.setScale(0.7);
        item.setImmovable(true);
    });
    // Colisión jugador-objeto
    this.physics.add.overlap(player, mountableGroup, onPickupMountable, null, this);
    // Texto de info de montura
    mountInfoText = this.add.text(16, 560, '', { font: '16px Arial', fill: '#fff' });
    mountInfoText.setScrollFactor(0);

    // Inicializa munición al seleccionar arma
    const weaponId = window.getCurrentWeapon && window.getCurrentWeapon();
    if (weaponId !== null && weaponId !== undefined) {
        const stats = getWeaponStats(weaponId);
        currentAmmo = stats.ammo;
        maxAmmo = stats.ammo;
    }

    shootSound = this.sound.add('shoot', { volume: 0.5 });
    reloadSound = this.sound.add('reload', { volume: 0.4 });
    hitSound = this.sound.add('hit', { volume: 0.6 });
    music = this.sound.add('combat_music', { loop: true, volume: 0.25 });
    music.play();

    // --- ESTÉTICA VISUAL Y AMBIENTE ---
    // Fondo y ambiente
    function setGameEnvironment(scene) {
        // Fondo de ciudad destruida con neblina púrpura y luces de neón
        scene.cameras.main.setBackgroundColor('#1a001a');
        const bg = scene.add.rectangle(400, 300, 800, 600, 0x1a001a, 1);
        bg.setDepth(-10);
        // Luces de neón y bioluminiscencia
        scene.add.rectangle(200, 100, 120, 20, 0xff00ff, 0.5).setDepth(-9);
        scene.add.rectangle(600, 500, 80, 18, 0x00ffff, 0.4).setDepth(-9);
        scene.add.rectangle(400, 300, 200, 40, 0xff2222, 0.2).setDepth(-9);
        // Efecto de niebla
        scene.add.rectangle(400, 300, 800, 600, 0x330033, 0.08).setDepth(-8);
    }

    setGameEnvironment(this);
}

// Llama a renderLevel en create()
const oldCreateLevel = create;
create = function() {
    oldCreateLevel.call(this);
    renderLevel(this);
    // ...existing code...
};

// --- AMBIENTE OSCURO Y GROTESCO ---
function setGrotesqueEnvironment(scene) {
    // Fondo oscuro y claustrofóbico
    scene.cameras.main.setBackgroundColor('#0a0010');
    const bg = scene.add.rectangle(400, 300, 800, 600, 0x0a0010, 1);
    bg.setDepth(-20);
    // Paredes que sangran
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
    // Luces LED parpadeantes y bioluminiscencia
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
    // Interfaz holográfica rota
    let holo = scene.add.rectangle(400, 80, 180, 32, 0x00ffff, 0.18).setDepth(-17);
    scene.tweens.add({
        targets: holo,
        alpha: { from: 0.18, to: 0.05 },
        duration: 700,
        yoyo: true,
        repeat: -1
    });
    // Carne viva y acero en el suelo
    for (let i = 0; i < 3; i++) {
        let flesh = scene.add.rectangle(Phaser.Math.Between(100, 700), Phaser.Math.Between(400, 580), Phaser.Math.Between(80, 200), Phaser.Math.Between(20, 40), 0x7a0033, 0.5).setDepth(-16);
        let steel = scene.add.rectangle(flesh.x, flesh.y + 10, flesh.width, 8, 0xcccccc, 0.4).setDepth(-15);
    }
}

// Armas biomecánicas: efecto de latido
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

// Enemigos grotescos: carne expuesta y circuitos
function spawnGrotesqueEnemy(scene, x, y, typeIdx) {
    const type = enemyTypes[typeIdx % enemyTypes.length];
    let enemy = scene.physics.add.sprite(x, y, type.key);
    enemy.setTint(type.color);
    enemy.setScale(Phaser.Math.FloatBetween(1.1, 1.5));
    // Carne expuesta (overlay)
    let flesh = scene.add.rectangle(enemy.x, enemy.y, 32, 18, 0xaa0033, 0.5);
    flesh.setDepth(1);
    // Circuitos visibles (overlay)
    let circuit = scene.add.rectangle(enemy.x, enemy.y + 10, 24, 6, 0x00ffff, 0.4);
    circuit.setDepth(1);
    scene.tweens.add({
        targets: circuit,
        alpha: { from: 0.4, to: 0.1 },
        duration: 600,
        yoyo: true,
        repeat: -1
    });
    // Animación de mutación/gore al morir
    enemy.on('killed', () => spawnGoreEffect(scene, enemy.x, enemy.y));
    return enemy;
}

// Interiores de nave: intestinos y acero
function drawGrotesqueShipInterior(scene) {
    for (let i = 0; i < 2; i++) {
        let intestine = scene.add.ellipse(Phaser.Math.Between(120, 680), Phaser.Math.Between(120, 480), Phaser.Math.Between(120, 220), Phaser.Math.Between(30, 60), 0x7a0033, 0.25);
        intestine.setDepth(-14);
        let steel = scene.add.rectangle(intestine.x, intestine.y + 18, intestine.width, 10, 0xcccccc, 0.18).setDepth(-13);
    }
}

// Llama a estas funciones en create()
const oldCreateGrotesque = create;
create = function() {
    oldCreateGrotesque.call(this);
    setGrotesqueEnvironment(this);
    drawGrotesqueShipInterior(this);
    animateBiomechWeapon(this, weaponSprite);
    // ...existing code...
};

function update() {
    // Movimiento del jugador
    let baseSpeed = 200;
    let speed = currentMount ? currentMount.speed : baseSpeed;
    if (keys.run.isDown && !isCrouching && !isProne) speed = speed * 1.7;
    if (isCrouching) speed = speed * 0.5;
    if (isProne) speed = speed * 0.3;
    player.setVelocity(0);
    let moving = false;
    // Izquierda/derecha/retroceder
    if (cursors.left.isDown) {
        player.setVelocityX(-speed);
        moving = true;
    } else if (cursors.right.isDown) {
        player.setVelocityX(speed);
        moving = true;
    }
    if (cursors.up.isDown) {
        player.setVelocityY(-speed);
        moving = true;
    } else if (cursors.down.isDown) {
        player.setVelocityY(speed);
        moving = true;
    }
    // Saltar
    if (Phaser.Input.Keyboard.JustDown(keys.jump) && canJump && !isProne) {
        player.setVelocityY(jumpVelocity);
        isJumping = true;
        canJump = false;
        setTimeout(() => { canJump = true; }, 600);
    }
    // Correr
    // (ya incluido en speed)
    // Agacharse
    if (keys.crouch.isDown && !isProne) {
        isCrouching = true;
    } else {
        isCrouching = false;
    }
    // Acostarse
    if (keys.prone.isDown) {
        isProne = true;
        isCrouching = false;
    } else if (!keys.prone.isDown && !keys.crouch.isDown) {
        isProne = false;
    }
    // Acostarse con mira
    if (keys.proneAim.isDown) {
        isProne = true;
        isAiming = true;
    } else if (!keys.proneAim.isDown) {
        isAiming = false;
    }
    // Mirar agachado
    if (keys.aim.isDown && isCrouching) {
        isAiming = true;
    } else if (!keys.aim.isDown && !keys.proneAim.isDown) {
        isAiming = false;
    }
    // Animación según estado
    if (isProne) {
        player.setScale(1, 0.5);
    } else if (isCrouching) {
        player.setScale(1, 0.7);
    } else {
        player.setScale(1, 1);
    }

    // Posicionar el sprite del arma sobre el jugador
    weaponSprite.x = player.x + 32;
    weaponSprite.y = player.y;

    // Sombra sigue al jugador
    shadow.x = player.x;
    shadow.y = player.y + 28;
    // Partículas solo si se mueve
    if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
        particles.emitters.list[0].setPosition(player.x, player.y + 28);
        particles.emitters.list[0].setQuantity(2);
    } else {
        particles.emitters.list[0].setQuantity(0);
    }

    // Cambiar de arma con Q/E
    if (Phaser.Input.Keyboard.JustDown(keys.nextWeapon)) {
        const newId = window.nextWeapon && window.nextWeapon();
        if (newId !== null && newId !== undefined) {
            updateWeaponSprite.call(this);
        }
    }
    if (Phaser.Input.Keyboard.JustDown(keys.prevWeapon)) {
        const newId = window.prevWeapon && window.prevWeapon();
        if (newId !== null && newId !== undefined) {
            updateWeaponSprite.call(this);
        }
    }
    // Cambiar de traje con T
    if (Phaser.Input.Keyboard.JustDown(keys.nextSkin)) {
        if (skinType === 'gears') {
            skinIndex = (skinIndex + 1) % totalGearsSkins;
        } else {
            skinIndex = (skinIndex + 1) % totalHaloSkins;
        }
        updateSkinSprite();
        updateSkinInfoText();
    }
    if (Phaser.Input.Keyboard.JustDown(keys.toggleSkinType)) {
        skinType = skinType === 'gears' ? 'halo' : 'gears';
        skinIndex = 0;
        updateSkinSprite();
        updateSkinInfoText();
    }
    // Animación según movimiento
    if (skinType === 'gears') {
        if (moving) {
            player.anims.play('gears_run_' + skinIndex, true);
        } else {
            player.anims.play('gears_idle_' + skinIndex, true);
        }
    } else {
        if (moving) {
            player.anims.play('halo_run_' + skinIndex, true);
        } else {
            player.anims.play('halo_idle_' + skinIndex, true);
        }
    }
    // Lógica de disparo
    if (Phaser.Input.Keyboard.JustDown(keys.shoot)) {
        shootWeapon();
    }
}

function updateSkinSprite() {
    if (skinType === 'gears') {
        player.setTexture('gear_skin_' + skinIndex, 0);
    } else {
        player.setTexture('halo_skin_' + skinIndex, 0);
    }
    // Efecto de destello al cambiar de skin
    if (skinFlashTween) skinFlashTween.stop();
    player.setAlpha(0.3);
    skinFlashTween = player.scene.tweens.add({
        targets: player,
        alpha: 1,
        duration: 200,
        ease: 'Quad.easeIn'
    });
}

function updateSkinInfoText() {
    let skinName = '';
    if (skinType === 'gears') {
        skinName = gearsSkinNames[skinIndex] || `Gears ${skinIndex+1}`;
    } else {
        skinName = haloSkinNames[skinIndex] || `Halo ${skinIndex+1}`;
    }
    skinInfoText.setText(`Skin: ${skinName}\nTipo: ${skinType.charAt(0).toUpperCase() + skinType.slice(1)}`);
}

async function updateWeaponSprite() {
    // Obtiene el ID del arma seleccionada desde Blockchain.js
    const weaponId = window.getCurrentWeapon && window.getCurrentWeapon();
    if (weaponId !== null && weaponId !== undefined) {
        weaponSprite.setTexture('arma_' + weaponId);
        // Obtener info del arma desde el contrato (opcional: requiere función getWeapons o similar)
        if (window.contract && window.contract.weapons) {
            try {
                const weapon = await window.contract.weapons(weaponId);
                weaponInfoText.setText(
                    `Arma: ${weapon.name}\nDaño: ${weapon.damage}\nDurabilidad: ${weapon.durability}\nPrecio: ${weapon.price} NEXO`
                );
            } catch (e) {
                weaponInfoText.setText(`Arma ID: ${weaponId}`);
            }
        } else {
            weaponInfoText.setText(`Arma ID: ${weaponId}`);
        }
    } else {
        weaponSprite.setTexture('arma_0'); // Por defecto
        weaponInfoText.setText('Sin arma seleccionada');
    }
}

function getWeaponStats(weaponId) {
    // Relaciona el weaponId con el tipo de arma (puedes mapearlo según tu contrato)
    return weaponTypes[weaponId % weaponTypes.length];
}

// --- SONIDO INMERSIVO Y EFECTOS ---
let shootSound, reloadSound, hitSound, music, directionalAudio;

// Agrega los sonidos en el preload existente
const originalPreload = preload;
preload = function() {
    if (originalPreload) originalPreload.call(this);
    this.load.audio('shoot', 'assets/sounds/shoot.wav');
    this.load.audio('reload', 'assets/sounds/reload.wav');
    this.load.audio('hit', 'assets/sounds/hit.wav');
    this.load.audio('combat_music', 'assets/sounds/combat_music.mp3');
};

// Agrega los sonidos en el create existente
const originalCreate = create;
create = function() {
    if (originalCreate) originalCreate.call(this);
    shootSound = this.sound.add('shoot', { volume: 0.5 });
    reloadSound = this.sound.add('reload', { volume: 0.4 });
    hitSound = this.sound.add('hit', { volume: 0.6 });
    music = this.sound.add('combat_music', { loop: true, volume: 0.25 });
    music.play();
};

// Efecto de disparo
const originalShootWeapon = shootWeapon;
shootWeapon = function() {
    if (shootSound) shootSound.play();
    if (originalShootWeapon) originalShootWeapon.apply(this, arguments);
};

// Efecto de recarga
const originalReloadWeapon = reloadWeapon;
reloadWeapon = function() {
    if (reloadSound) reloadSound.play();
    if (originalReloadWeapon) originalReloadWeapon.apply(this, arguments);
};

// Sonido direccional para enemigos
function playDirectionalEnemySound(scene, enemyX, enemyY) {
    const dx = enemyX - player.x;
    const pan = Math.max(-1, Math.min(1, dx / 400));
    if (!directionalAudio) {
        directionalAudio = scene.sound.add('hit', { volume: 0.7, pan });
    } else {
        directionalAudio.setPan(pan);
    }
    directionalAudio.play();
}
// Llama a playDirectionalEnemySound(this, enemigo.x, enemigo.y) cuando un enemigo dispare o sea detectado

// Lógica para disparar con click o barra espaciadora
function setupShootingControls(scene) {
    scene.input.keyboard.on('keydown-SPACE', shootWeapon);
    scene.input.on('pointerdown', shootWeapon);
}

// Llama a setupShootingControls en create()
const oldCreate = create;
create = function() {
    oldCreate.call(this);
    setupShootingControls(this);
    // Inicializa munición al seleccionar arma
    const weaponId = window.getCurrentWeapon && window.getCurrentWeapon();
    if (weaponId !== null && weaponId !== undefined) {
        const stats = getWeaponStats(weaponId);
        currentAmmo = stats.ammo;
        maxAmmo = stats.ammo;
    }
};

// Refuerza la validación on-chain para recogibles y montables
async function onPickupMountable(player, item) {
    const obj = item.getData('mountable');
    if (!currentMount) {
        // Validar propiedad on-chain antes de montar
        if (window.contract && window.signer && window.contract.getPlayerMountables) {
            const address = await window.signer.getAddress();
            const ownedMountables = await window.contract.getPlayerMountables(address);
            const ownedIds = ownedMountables.map(id => Number(id));
            if (!ownedIds.includes(mountables.findIndex(m => m.key === obj.key))) {
                mountInfoText.setText('Debes comprar este objeto en la tienda (on-chain) para poder montarlo.');
                return;
            }
        } else {
            mountInfoText.setText('Conéctate a la blockchain para validar propiedad.');
            return;
        }
        currentMount = obj;
        mountInfoText.setText('Montado en: ' + obj.name + ' (Velocidad: ' + obj.speed + ')');
        mountableGroup.remove(item, true, true);
    }
}

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
        // Puedes usar esto para rutas alternativas (por ejemplo, túneles o caminos elevados)
        { from: { x: 100, y: 100 }, to: { x: 700, y: 500 } }
    ],
    roads: [
        { x: 50, y: 550, width: 700, height: 30 }, // carretera principal
        { x: 300, y: 100, width: 200, height: 20 } // carretera secundaria
    ],
    bridges: [
        { x: 350, y: 300, width: 120, height: 18 } // puente
    ],
    trainTracks: [
        { x: 100, y: 500, width: 600, height: 10 }, // vía de tren
        { x: 200, y: 400, width: 300, height: 10 } // túnel de tren
    ],
    runways: [
        { x: 600, y: 80, width: 180, height: 24, type: 'avion' },
        { x: 80, y: 420, width: 120, height: 24, type: 'helicoptero' }
    ],
    // Edificios (verticalidad y cobertura)
    buildings: [
        { x: 150, y: 150, width: 80, height: 120 },
        { x: 600, y: 100, width: 100, height: 180 }
    ],
    // Colinas (verticalidad, solo visual)
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
        scene.physics.add.existing(cover, true); // Estático
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

// Efectos gore y sangre
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
    // Desmembramiento visual (sprites de partes)
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

// Enemigos: cyborgs mutados, soldados infectados, bestias bioingenierizadas, humanos-máquina
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
        // Mutante de laboratorio: overlay de cables y tubos
        let tech = scene.add.rectangle(enemy.x, enemy.y, 28, 8, 0xcccccc, 0.5);
        tech.setDepth(1);
    }
    if (type.organic) {
        // Drone corrupto: partículas orgánicas
        scene.add.particles('blood').createEmitter({ x: enemy.x, y: enemy.y, speed: 20, scale: { start: 0.2, end: 0 }, lifespan: 600, quantity: 1, alpha: { start: 0.5, end: 0 } });
    }
    if (type.cries) {
        // Clon defectuoso: llora mientras ataca
        let cry = scene.add.text(enemy.x, enemy.y - 30, '¡Ayyy!', { font: '12px Arial', fill: '#fff' });
        scene.tweens.add({ targets: cry, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });
    }
    if (type.grotesque) {
        // Bestia transdimensionada: múltiples extremidades
        for (let i = 0; i < 4 + Math.floor(Math.random()*4); i++) {
            let limb = scene.add.rectangle(enemy.x + Phaser.Math.Between(-30,30), enemy.y + Phaser.Math.Between(-30,30), 8, 32, 0x212f3c, 0.5);
            limb.setAngle(Phaser.Math.Between(0,360));
            limb.setDepth(1);
        }
    }
    // Animación de mutación/gore al morir
    enemy.on('killed', () => spawnGoreEffect(scene, enemy.x, enemy.y));
    return enemy;
}

// --- Vehículo aliado ---
let allyVehicle = null;
let onVehicleRoof = false;

function spawnAllyVehicle(scene, x, y) {
    allyVehicle = scene.physics.add.sprite(x, y, 'ally_vehicle');
    allyVehicle.setImmovable(true);
    allyVehicle.setData('isAllyVehicle', true);
    // Torretas biomecánicas
    allyVehicle.turrets = [];
    for (let i = 0; i < 2; i++) {
        let turret = scene.add.sprite(x + (i ? 40 : -40), y - 20, 'biomech_turret');
        turret.setDepth(1);
        allyVehicle.turrets.push(turret);
    }
    // Colisión con jugador para subir
    scene.physics.add.overlap(player, allyVehicle, () => {
        if (!onVehicleRoof && Phaser.Input.Keyboard.JustDown(keys.jump)) {
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

function updateAllyVehicle(scene) {
    if (!allyVehicle) return;
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

// Llama a spawnAllyVehicle en create y updateAllyVehicle en update
const oldCreateAlly = create;
create = function() {
    oldCreateAlly.call(this);
    spawnAllyVehicle(this, 300, 500);
};
const oldUpdateAlly = update;
update = function() {
    oldUpdateAlly.call(this);
    updateAllyVehicle(this);
};

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

// Disparo de mochila cohete
function shootJetpack(scene, pointer) {
    // Calcula ángulo entre jugador y objetivo (mouse o joystick)
    let targetX = pointer.worldX !== undefined ? pointer.worldX : pointer.x;
    let targetY = pointer.worldY !== undefined ? pointer.worldY : pointer.y;
    let angle = Phaser.Math.Angle.Between(player.x, player.y, targetX, targetY);
    // Posición inicial del proyectil (desde la mochila)
    let offset = 24;
    let projX = player.x + Math.cos(angle) * offset;
    let projY = player.y + Math.sin(angle) * offset;
    let rocket = scene.physics.add.sprite(projX, projY, 'jetpack_rocket');
    rocket.rotation = angle;
    scene.physics.velocityFromRotation(angle, 700, rocket.body.velocity);
    setTimeout(() => rocket.destroy(), 1200);
    // Sonido y efecto opcional
    if (scene.sound) scene.sound.play('shoot');
}
// Asignar disparo a click derecho o botón de gamepad
scene.input.on('pointerdown', function(pointer) {
    if (pointer.rightButtonDown()) shootJetpack(scene, pointer);
});
if (scene.input.gamepad) {
    scene.input.gamepad.on('down', function(pad, button, index) {
        if (button.index === 1) { // Botón B o equivalente
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

// --- Katanas famosas ---
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

// Nuevas granadas
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

// --- Ejemplo de uso de granadas en el juego ---
function useGrenade(grenadeId) {
    const grenade = grenades.find(g => g.id === grenadeId);
    if (!grenade) return;
    // Lógica para lanzar la granada
    let grenadeSprite = this.physics.add.sprite(player.x, player.y, grenadeId);
    grenadeSprite.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
    // Efecto de explosión
    grenadeSprite.on('animationcomplete', () => {
        grenadeSprite.setVisible(false);
        this.time.addEvent({
            delay: 100,
            callback: () => { grenadeSprite.destroy(); },
            callbackScope: this
        });
    });
    // Sonido de explosión
    if (this.sound) {
        let explosionSound = this.sound.add('explosion');
        explosionSound.play({ volume: 0.7 });
    }
}

// Asignar uso de granadas a una tecla (ejemplo: G)
keys.useGrenade = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
this.input.keyboard.on('keydown-G', () => {
    useGrenade('frag9x');
});
