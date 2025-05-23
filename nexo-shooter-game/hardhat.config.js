Here is the content for the Solidity contract that includes the NEXO token and the multiplayer shooting game system with the specified features:

// filepath: /workspaces/SHOTSNEXOS/NexoGame.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NEXO Token and Game Contract
/// @notice Este contrato incluye un token ERC20 y lógica para un sistema de juego multijugador.
contract NexoGame is ERC20, Ownable {
    uint256 private constant INITIAL_SUPPLY = 10_000_000 * 10 ** 18; // Suministro inicial de 10 millones

    enum GameMode { BattleRoyale, CaptureTheFlag, FreeForAll }
    GameMode public currentGameMode;

    struct Weapon {
        uint256 id;
        string name;
        uint256 price; // Precio en tokens NEXO
        uint256 damage;
        uint256 durability;
    }

    struct Player {
        address wallet;
        uint256[] ownedWeapons; // Lista de IDs de armas
        uint256 kills; // Número de eliminaciones
        uint256 deaths; // Número de muertes
        uint256 score; // Puntuación acumulada
    }

    Weapon[] public weapons; // Lista de armas disponibles en la tienda
    mapping(address => Player) public players; // Mapeo de jugadores registrados

    // Eventos
    event WeaponAdded(uint256 weaponId, string name, uint256 price, uint256 damage, uint256 durability);
    event WeaponPurchased(address indexed player, uint256 weaponId);
    event PlayerRegistered(address indexed player);
    event GameModeStarted(GameMode mode);

    // Constructor
    constructor() ERC20("NEXO", "NEXO") {
        _mint(msg.sender, INITIAL_SUPPLY); // Asignar suministro inicial al creador del contrato
    }

    // Funciones de Gestión de Armas
    function addWeapon(
        string memory name,
        uint256 price,
        uint256 damage,
        uint256 durability
    ) external onlyOwner {
        weapons.push(Weapon(weapons.length, name, price, damage, durability));
        emit WeaponAdded(weapons.length - 1, name, price, damage, durability);
    }

    function purchaseWeapon(uint256 weaponId) external {
        require(weaponId < weapons.length, "El arma no existe");
        Weapon memory weapon = weapons[weaponId];
        require(balanceOf(msg.sender) >= weapon.price, "Fondos insuficientes");

        // Transferir tokens al propietario del contrato
        _transfer(msg.sender, owner(), weapon.price);

        // Agregar arma al inventario del jugador
        players[msg.sender].ownedWeapons.push(weapon.id);

        emit WeaponPurchased(msg.sender, weapon.id);
    }

    // Funciones de Gestión de Jugadores
    function registerPlayer() external {
        require(players[msg.sender].wallet == address(0), "Jugador ya registrado");
        players[msg.sender] = Player(msg.sender, new uint256[](0), 0, 0, 0);
        emit PlayerRegistered(msg.sender);
    }

    function getPlayerInventory(address player) external view returns (uint256[] memory) {
        return players[player].ownedWeapons;
    }

    // Funciones de Gestión de Modos de Juego
    function startGameMode(GameMode mode) external onlyOwner {
        currentGameMode = mode;
        emit GameModeStarted(mode);
    }

    // Funciones adicionales para el juego pueden ser añadidas aquí
}