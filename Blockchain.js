const contractAddress = "TU_CONTRATO_DIRECCIÓN";
const abi = [ /* ABI del contrato */ ];

let provider;
let signer;
let contract;

async function connectBlockchain() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        contract = new ethers.Contract(contractAddress, abi, signer);
        console.log("Conexión con blockchain establecida");
    } else {
        alert("Instala MetaMask para usar el juego");
    }
}

async function buyWeapon(weaponId) {
    try {
        const tx = await contract.purchaseWeapon(weaponId);
        await tx.wait();
        console.log("Arma comprada con éxito");
    } catch (err) {
        console.error("Error al comprar arma:", err);
    }
}

window.onload = connectBlockchain;
const { ethers } = require('ethers');

let provider, signer, contract;

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [ /* ABI del contrato inteligente */ ];

async function connectBlockchain() {
    try {
        provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        signer = wallet.connect(provider);
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log('Conexión con blockchain establecida');
    } catch (err) {
        console.error('Error al conectar con blockchain:', err);
    }
}

async function buyWeapon(playerId, weaponId) {
    try {
        const tx = await contract.purchaseWeapon(weaponId);
        await tx.wait();
        console.log(`Arma comprada por el jugador ${playerId}: ID ${weaponId}`);
    } catch (err) {
        console.error('Error al comprar arma:', err);
        throw new Error('Compra de arma fallida');
    }
}

module.exports = { connectBlockchain, buyWeapon };
