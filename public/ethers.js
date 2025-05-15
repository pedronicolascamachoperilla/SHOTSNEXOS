const { ethers } = require("ethers");
require("dotenv").config();

// Configuración del contrato
const contractABI = require("./NexoGameABI.json"); // Asegúrate de incluir el ABI del contrato compilado
const contractAddress = process.env.CONTRACT_ADDRESS; // Dirección del contrato
const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Función para registrar un jugador
async function registerPlayer() {
    try {
        const tx = await contract.registerPlayer();
        await tx.wait();
        console.log("Jugador registrado con éxito.");
    } catch (error) {
        console.error("Error al registrar el jugador:", error);
    }
}

// Función para comprar un arma
async function purchaseWeapon(weaponId) {
    try {
        const tx = await contract.purchaseWeapon(weaponId);
        await tx.wait();
        console.log(`Arma con ID ${weaponId} comprada con éxito.`);
    } catch (error) {
        console.error("Error al comprar el arma:", error);
    }
}

// Función para agregar una nueva arma (solo administrador)
async function addWeapon(name, price, damage, durability) {
    try {
        const tx = await contract.addWeapon(name, price, damage, durability);
        await tx.wait();
        console.log(`Arma "${name}" agregada con éxito.`);
    } catch (error) {
        console.error("Error al agregar el arma:", error);
    }
}

// Función para obtener el inventario de un jugador
async function getPlayerWeapons(playerAddress) {
    try {
        const weapons = await contract.getPlayerWeapons(playerAddress);
        console.log(`Armas del jugador ${playerAddress}:`, weapons);
        return weapons;
    } catch (error) {
        console.error("Error al obtener las armas del jugador:", error);
    }
}

// Ejemplo de uso
(async () => {
    // Registrar un jugador
    await registerPlayer();

    // Agregar un arma (solo administrador)
    const weaponName = "Rifle de asalto";
    const weaponPrice = ethers.utils.parseEther("10"); // Precio en tokens NEXO
    const weaponDamage = 50;
    const weaponDurability = 100;
    await addWeapon(weaponName, weaponPrice, weaponDamage, weaponDurability);

    // Comprar un arma
    const weaponId = 0; // ID del arma en la tienda
    await purchaseWeapon(weaponId);

    // Obtener inventario del jugador
    const playerAddress = wallet.address; // Dirección del jugador
    await getPlayerWeapons(playerAddress);
})();
