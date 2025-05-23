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
}

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

async function onPickupMountable(player, item) {
    const obj = item.getData('mountable');
    if (!currentMount) {
        // Validar propiedad on-chain antes de montar
        if (window.contract && window.signer && window.contract.getPlayerMountables) {
            const address = await window.signer.getAddress();
            const ownedMountables = await window.contract.getPlayerMountables(address);
            const ownedIds = ownedMountables.map(id => Number(id));
            if (!ownedIds.includes(mountables.findIndex(m => m.key === obj.key))) {
                mountInfoText.setText('Debes comprar este objeto en la tienda para poder montarlo.');
                return;
            }
        }
        currentMount = obj;
        mountInfoText.setText('Montado en: ' + obj.name + ' (Velocidad: ' + obj.speed + ')');
        mountableGroup.remove(item, true, true);
    }
}
