// --- INTEGRACIÓN BLOCKCHAIN PARA FRONTEND (NAVEGADOR) ---
// Reemplaza con la dirección real de tu contrato y el ABI generado por Solidity
const contractAddress = "TU_CONTRATO_DIRECCION"; // <-- Cambia esto
const abi = [ /* Pega aquí el ABI de tu contrato NexoGame */ ];

let provider;
let signer;
let contract;
let playerInventory = [];
let currentWeaponIndex = 0;

// Mapeo de claves a IDs de montables
const mountableKeyToId = {
    'monstertruck': 0,
    'sportscar': 1,
    'jeep': 2,
    'motorbike': 3,
    'rocket backpack': 4,
    'parachute': 5,
    'ski board': 6,
    'surfer board': 7,
    'snowmobile': 8,
    'tank car': 9,
    'turret tank': 10
};

// Conectar a la blockchain usando MetaMask o wallet compatible
async function connectBlockchain() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Conexión con blockchain establecida");
        return true;
    } else {
        alert("Instala MetaMask o una wallet compatible para usar el juego");
        return false;
    }
}

// Obtener el inventario del jugador desde el contrato
async function getPlayerInventory() {
    if (!contract || !signer) {
        alert("Conéctate primero a la blockchain");
        return [];
    }
    try {
        const address = await signer.getAddress();
        const inventory = await contract.getPlayerInventory(address);
        playerInventory = inventory.map(id => Number(id));
        return playerInventory;
    } catch (err) {
        console.error("Error al obtener inventario:", err);
        return [];
    }
}

// Cambiar de arma (siguiente en el inventario)
function nextWeapon() {
    if (playerInventory.length === 0) return null;
    currentWeaponIndex = (currentWeaponIndex + 1) % playerInventory.length;
    return playerInventory[currentWeaponIndex];
}

// Cambiar de arma (anterior en el inventario)
function prevWeapon() {
    if (playerInventory.length === 0) return null;
    currentWeaponIndex = (currentWeaponIndex - 1 + playerInventory.length) % playerInventory.length;
    return playerInventory[currentWeaponIndex];
}

// Obtener la ID del arma actualmente seleccionada
function getCurrentWeapon() {
    if (playerInventory.length === 0) return null;
    return playerInventory[currentWeaponIndex];
}

// Comprar un arma llamando al contrato inteligente
async function buyWeapon(weaponId) {
    if (!contract) {
        alert("Conéctate primero a la blockchain");
        return false;
    }
    try {
        const tx = await contract.purchaseWeapon(weaponId);
        await tx.wait();
        alert("¡Arma comprada con éxito!");
        // Actualiza el inventario tras la compra
        await getPlayerInventory();
        return true;
    } catch (err) {
        console.error("Error al comprar arma:", err);
        alert("Error al comprar arma: " + (err.data?.message || err.message));
        return false;
    }
}

// Comprar un objeto montable (simulado)
async function buyMountable(mountKey) {
    if (!contract) {
        alert("Conéctate primero a la blockchain");
        return false;
    }
    const mountId = mountableKeyToId[mountKey];
    if (mountId === undefined) {
        alert('Objeto no válido');
        return false;
    }
    try {
        const tx = await contract.purchaseMountable(mountId);
        await tx.wait();
        alert('¡Has comprado: ' + mountKey + ' (on-chain)!');
        if (typeof window.renderMountableInventory === 'function') {
            window.renderMountableInventory();
        }
        return true;
    } catch (err) {
        console.error('Error al comprar montable:', err);
        alert('Error al comprar montable: ' + (err.data?.message || err.message));
        return false;
    }
}

// Mostrar inventario en el frontend (por ejemplo, en un div con id="inventory-list")
async function renderInventory() {
    const inventoryDiv = document.getElementById("inventory-list");
    if (!inventoryDiv) return;
    await getPlayerInventory();
    if (playerInventory.length === 0) {
        inventoryDiv.innerHTML = "<p>No tienes armas en tu inventario.</p>";
        return;
    }
    inventoryDiv.innerHTML = "<h3>Inventario</h3>";
    playerInventory.forEach((weaponId, idx) => {
        const selected = idx === currentWeaponIndex ? 'style="color:yellow;font-weight:bold;"' : '';
        inventoryDiv.innerHTML += `<div ${selected}>Arma ID: ${weaponId}</div>`;
    });
}

// Exportar funciones globales para usarlas desde el HTML o game.js
window.connectBlockchain = connectBlockchain;
window.buyWeapon = buyWeapon;
window.getPlayerInventory = getPlayerInventory;
window.nextWeapon = nextWeapon;
window.prevWeapon = prevWeapon;
window.getCurrentWeapon = getCurrentWeapon;
window.renderInventory = renderInventory;
window.buyMountable = buyMountable;
