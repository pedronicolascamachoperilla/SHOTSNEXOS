// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NEXO Token and Game Contract
/// @notice Token ERC20 y lógica de juego multijugador con armas y montables comprables, supply escalable y compatible multired.
contract NexoGame is ERC20, Ownable {
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000_000_000 * 10 ** 18; // 1 cuatrillón de tokens

    struct Weapon {
        uint256 id;
        string name;
        uint256 price;
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
    }
    struct Mountable {
        uint256 id;
        string name;
        uint256 price;
        uint256 speed;
    }

    Weapon[] public weapons;
    mapping(address => Player) public players;
    Mountable[] public mountables;
    mapping(address => uint256[]) public playerMountables;

    event WeaponAdded(uint256 weaponId, string name, uint256 price, uint256 damage, uint256 durability);
    event WeaponPurchased(address indexed player, uint256 weaponId);
    event PlayerRegistered(address indexed player, string username);
    event MountableAdded(uint256 mountableId, string name, uint256 price, uint256 speed);
    event MountablePurchased(address indexed player, uint256 mountableId);
    event GameModeStarted(string modeName);
    event PlayerStatsUpdated(address indexed player, uint256 kills, uint256 deaths, uint256 score);

    constructor() ERC20("NEXO", "NEXO") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // --- Armas ---
    function addWeapon(string memory name, uint256 price, uint256 damage, uint256 durability) external onlyOwner {
        weapons.push(Weapon(weapons.length, name, price, damage, durability));
        emit WeaponAdded(weapons.length - 1, name, price, damage, durability);
    }
    function purchaseWeapon(uint256 weaponId) external {
        require(players[msg.sender].registered, "Debes registrarte primero");
        require(weaponId < weapons.length, "Arma no existe");
        Weapon memory weapon = weapons[weaponId];
        require(balanceOf(msg.sender) >= weapon.price, "Fondos insuficientes");
        _transfer(msg.sender, owner(), weapon.price);
        players[msg.sender].ownedWeapons.push(weapon.id);
        emit WeaponPurchased(msg.sender, weapon.id);
    }
    function getPlayerInventory(address player) external view returns (uint256[] memory) {
        return players[player].ownedWeapons;
    }

    // --- Montables ---
    function addMountable(string memory name, uint256 price, uint256 speed) external onlyOwner {
        mountables.push(Mountable(mountables.length, name, price, speed));
        emit MountableAdded(mountables.length - 1, name, price, speed);
    }
    function purchaseMountable(uint256 mountableId) external {
        require(mountableId < mountables.length, "El objeto no existe");
        Mountable memory m = mountables[mountableId];
        require(balanceOf(msg.sender) >= m.price, "Fondos insuficientes");
        _transfer(msg.sender, owner(), m.price);
        playerMountables[msg.sender].push(mountableId);
        emit MountablePurchased(msg.sender, mountableId);
    }
    function getPlayerMountables(address player) external view returns (uint256[] memory) {
        return playerMountables[player];
    }

    // --- Jugadores ---
    function registerPlayer(string memory username) external {
        require(!players[msg.sender].registered, "Ya registrado");
        players[msg.sender] = Player(msg.sender, new uint256[](0), 0, 0, 0, true);
        emit PlayerRegistered(msg.sender, username);
    }

    // --- Modos de juego ---
    enum GameMode { BattleRoyale, CaptureTheFlag, FreeForAll }
    string[] public gameModes = ["Battle Royale", "Capture The Flag", "Free For All"];
    function startGame(uint256 modeIndex) external onlyOwner {
        require(modeIndex < gameModes.length, "Modo no válido");
        emit GameModeStarted(gameModes[modeIndex]);
    }

    // --- Estadísticas ---
    function updatePlayerStats(address player, uint256 kills, uint256 deaths, uint256 score) external onlyOwner {
        require(players[player].registered, "Jugador no registrado");
        players[player].kills += kills;
        players[player].deaths += deaths;
        players[player].score += score;
        emit PlayerStatsUpdated(player, kills, deaths, score);
    }
}