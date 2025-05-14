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
