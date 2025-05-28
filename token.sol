// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title NEXO Token y Sistema de Juego Multijugador
/// @notice Token ERC20 y lógica de juego para battle royale, CTF y FFA, con compra de armas y objetos por el admin
contract NexoGame is ERC20, Ownable, Pausable {
    using SafeERC20 for IERC20;
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000_000_000 * 10 ** 18;

    struct Weapon {
        uint256 id;
        string name;
        uint256 price; // en NEXO
        uint256 damage;
        uint256 durability;
        address acceptedToken; // Permite comprar con cualquier ERC20
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
    mapping(address => bool) public isWeaponSeller;

    enum GameMode { BattleRoyale, CaptureTheFlag, FreeForAll }
    GameMode public currentGameMode;
    string[] public gameModes = ["Battle Royale", "Capture The Flag", "Free For All"];

    event WeaponAdded(uint256 weaponId, string name, uint256 price, uint256 damage, uint256 durability, address acceptedToken);
    event WeaponPurchased(address indexed player, uint256 weaponId, address tokenUsed);
    event PlayerRegistered(address indexed player, string username);
    event GameModeStarted(GameMode mode);
    event PlayerStatsUpdated(address indexed player, uint256 kills, uint256 deaths, uint256 score);
    event SellerStatusChanged(address indexed seller, bool status);

    constructor() ERC20("NEXO", "NEXO") {
        _mint(msg.sender, INITIAL_SUPPLY);
        isWeaponSeller[msg.sender] = true;
    }

    // ----------- Pausa -----------
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ----------- Gestión de Vendedores -----------
    function setWeaponSeller(address seller, bool status) external onlyOwner {
        isWeaponSeller[seller] = status;
        emit SellerStatusChanged(seller, status);
    }

    // ----------- Gestión de Armas -----------
    function addWeapon(
        string memory name,
        uint256 price,
        uint256 damage,
        uint256 durability,
        address acceptedToken
    ) external {
        require(isWeaponSeller[msg.sender], "Solo vendedores pueden agregar armas");
        weapons.push(Weapon(weapons.length, name, price, damage, durability, acceptedToken));
        emit WeaponAdded(weapons.length - 1, name, price, damage, durability, acceptedToken);
    }

    function purchaseWeapon(uint256 weaponId, address token) external whenNotPaused {
        require(players[msg.sender].registered, "Debes registrarte primero");
        require(weaponId < weapons.length, "El arma no existe");
        Weapon memory weapon = weapons[weaponId];
        require(token == weapon.acceptedToken, "Token no aceptado para esta arma");
        if(token == address(this)) {
            require(balanceOf(msg.sender) >= weapon.price, "Fondos NEXO insuficientes");
            _transfer(msg.sender, owner(), weapon.price);
        } else {
            IERC20(token).safeTransferFrom(msg.sender, owner(), weapon.price);
        }
        players[msg.sender].ownedWeapons.push(weapon.id);
        emit WeaponPurchased(msg.sender, weaponId, token);
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

    // ----------- Actualización de estadísticas -----------
    function updatePlayerStats(address player, uint256 kills, uint256 deaths, uint256 score) external onlyOwner {
        require(players[player].registered, "Jugador no registrado");
        players[player].kills = kills;
        players[player].deaths = deaths;
        players[player].score = score;
        emit PlayerStatsUpdated(player, kills, deaths, score);
    }

    // ----------- Compatibilidad Multichain -----------
    // El contrato es compatible con cualquier red EVM y tokens ERC20
}
