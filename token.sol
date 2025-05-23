// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title NEXO Token y Sistema de Juego Multijugador
/// @notice Token ERC20 y lógica de juego para battle royale, CTF y FFA, con compra de armas y objetos por el admin
contract NexoGame is ERC20, Ownable, Pausable {
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000_000_000 * 10 ** 18; // 1 cuatrillón

    // Estructuras de armas y jugadores
    struct Weapon {
        uint256 id;
        string name;
        uint256 price; // en NEXO
        uint256 damage;
        uint256 durability;
    }
    struct Player {
        address wallet;
        uint256[] ownedWeapons;
        uint256 kills;
        uint256 deaths;
        uint256 score;
        bool registered;
        string username;
    }

    Weapon[] public weapons;
    mapping(address => Player) public players;
    mapping(string => address) public usernameToAddress;

    // Modos de juego
    enum GameMode { BattleRoyale, CaptureTheFlag, FreeForAll }
    GameMode public currentGameMode;
    string[] public gameModes = ["Battle Royale", "Capture The Flag", "Free For All"];

    // Eventos
    event WeaponAdded(uint256 weaponId, string name, uint256 price, uint256 damage, uint256 durability);
    event WeaponPurchased(address indexed player, uint256 weaponId);
    event PlayerRegistered(address indexed player, string username);
    event GameModeStarted(GameMode mode);
    event PlayerStatsUpdated(address indexed player, uint256 kills, uint256 deaths, uint256 score);

    // Constructor
    constructor() ERC20("NEXO", "NEXO") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ----------- Funciones de Pausa -----------
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ----------- Gestión de Armas -----------
    function addWeapon(
        string memory name,
        uint256 price,
        uint256 damage,
        uint256 durability
    ) external onlyOwner whenNotPaused {
        weapons.push(Weapon(weapons.length, name, price, damage, durability));
        emit WeaponAdded(weapons.length - 1, name, price, damage, durability);
    }

    function purchaseWeapon(uint256 weaponId) external whenNotPaused {
        require(players[msg.sender].registered, "Debes registrarte primero");
        require(weaponId < weapons.length, "El arma no existe");
        Weapon memory weapon = weapons[weaponId];
        require(balanceOf(msg.sender) >= weapon.price, "Fondos insuficientes");
        _transfer(msg.sender, owner(), weapon.price);
        players[msg.sender].ownedWeapons.push(weapon.id);
        emit WeaponPurchased(msg.sender, weaponId);
    }

    // ----------- Gestión de Jugadores -----------
    function registerPlayer(string memory username) external whenNotPaused {
        require(!players[msg.sender].registered, "Ya registrado");
        require(usernameToAddress[username] == address(0), "Nombre de usuario en uso");
        players[msg.sender] = Player(msg.sender, new uint256[](0), 0, 0, 0, true, username);
        usernameToAddress[username] = msg.sender;
        emit PlayerRegistered(msg.sender, username);
    }

    function getPlayerInventory(address player) external view returns (uint256[] memory) {
        return players[player].ownedWeapons;
    }

    // ----------- Modos de Juego -----------
    function startGameMode(GameMode mode) external onlyOwner whenNotPaused {
        currentGameMode = mode;
        emit GameModeStarted(mode);
    }

    function updatePlayerStats(address player, uint256 kills, uint256 deaths, uint256 score) external onlyOwner whenNotPaused {
        require(players[player].registered, "Jugador no registrado");
        players[player].kills = kills;
        players[player].deaths = deaths;
        players[player].score = score;
        emit PlayerStatsUpdated(player, kills, deaths, score);
    }

    // ----------- Compatibilidad Multired y Multitoken -----------
    // Permite comprar armas con cualquier token ERC20 aprobado por el admin
    function purchaseWeaponWithToken(uint256 weaponId, address erc20, uint256 amount) external whenNotPaused {
        require(players[msg.sender].registered, "Debes registrarte primero");
        require(weaponId < weapons.length, "El arma no existe");
        Weapon memory weapon = weapons[weaponId];
        require(amount >= weapon.price, "Fondos insuficientes");
        IERC20(erc20).transferFrom(msg.sender, owner(), amount);
        players[msg.sender].ownedWeapons.push(weapon.id);
        emit WeaponPurchased(msg.sender, weaponId);
    }

    // ----------- Utilidades -----------
    function getWeapons() external view returns (Weapon[] memory) {
        return weapons;
    }
    function getPlayer(address player) external view returns (Player memory) {
        return players[player];
    }
}
