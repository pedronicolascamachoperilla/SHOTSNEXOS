// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title NEXO Token and Game Contract
/// @notice This contract includes an ERC20 token with an initial supply of 10,000,000,000,000 tokens
///         and logic to manage a multiplayer shooting game system.
contract NexoGame is ERC20, Ownable {
    uint256 private constant INITIAL_SUPPLY = 1_000_000_000_000_000 * 10 ** 18; // Initial supply of 1 quadrillion

    // Game Structures and Variables
    struct Weapon {
        uint256 id;
        string name;
        uint256 price; // Price in NEXO tokens
        uint256 damage;
        uint256 durability;
    }

    struct Player {
        address wallet;
        uint256[] ownedWeapons; // List of weapon IDs
        uint256 kills; // Number of kills
        uint256 deaths; // Number of deaths
        uint256 score; // Accumulated score
    }

    enum GameMode { BattleRoyale, CaptureTheFlag, FreeForAll }

    Weapon[] public weapons; // List of available weapons in the shop
    mapping(address => Player) public players; // Mapping of registered players
    string[] public gameModes = ["Battle Royale", "Capture The Flag", "Free For All"]; // Game modes

    // Events
    event WeaponAdded(uint256 weaponId, string name, uint256 price, uint256 damage, uint256 durability);
    event WeaponPurchased(address indexed player, uint256 weaponId);
    event PlayerRegistered(address indexed player);
    event GameModeStarted(string modeName);
    event PlayerStatsUpdated(address indexed player, uint256 kills, uint256 deaths, uint256 score);

    // Constructor
    constructor() ERC20("NEXO", "NEXO") {
        _mint(msg.sender, INITIAL_SUPPLY); // Assign initial supply to the contract creator
    }

    // Weapon Management Functions
    /// @notice Add a weapon to the shop (only admin)
    /// @param name Name of the weapon
    /// @param price Price in NEXO tokens
    /// @param damage Damage inflicted by the weapon
    /// @param durability Durability of the weapon
    function addWeapon(
        string memory name,
        uint256 price,
        uint256 damage,
        uint256 durability
    ) external onlyOwner {
        weapons.push(Weapon(weapons.length, name, price, damage, durability));
        emit WeaponAdded(weapons.length - 1, name, price, damage, durability);
    }

    /// @notice Purchase a weapon from the shop
    /// @param weaponId ID of the weapon to purchase
    function purchaseWeapon(uint256 weaponId) external {
        require(weaponId < weapons.length, "Weapon does not exist");
        Weapon memory weapon = weapons[weaponId];
        require(balanceOf(msg.sender) >= weapon.price, "Insufficient funds");

        // Transfer tokens to the contract owner
        _transfer(msg.sender, owner(), weapon.price);

        // Add weapon to the player's inventory
        players[msg.sender].ownedWeapons.push(weapon.id);

        emit WeaponPurchased(msg.sender, weapon.id);
    }

    // Player Management Functions
    /// @notice Register a player in the system
    function registerPlayer() external {
        require(players[msg.sender].wallet == address(0), "Player already registered");
        players[msg.sender] = Player(msg.sender, new uint256[](0), 0, 0, 0);
        emit PlayerRegistered(msg.sender);
    }

    /// @notice Get the player's inventory
    /// @param player Address of the player
    /// @return List of weapon IDs owned by the player
    function getPlayerInventory(address player) external view returns (uint256[] memory) {
        return players[player].ownedWeapons;
    }

    // Game Mode Functions
    /// @notice Start a game mode
    /// @param modeIndex Index of the game mode (0: BattleRoyale, 1: CaptureTheFlag, 2: FreeForAll)
    function startGame(uint256 modeIndex) external onlyOwner {
        require(modeIndex < gameModes.length, "Invalid game mode");
        emit GameModeStarted(gameModes[modeIndex]);
    }

    /// @notice Update player statistics
    /// @param player Address of the player
    /// @param kills Number of kills
    /// @param deaths Number of deaths
    /// @param score Score obtained
    function updatePlayerStats(
        address player,
        uint256 kills,
        uint256 deaths,
        uint256 score
    ) external onlyOwner {
        require(players[player].wallet != address(0), "Player not registered");
        players[player].kills += kills;
        players[player].deaths += deaths;
        players[player].score += score;

        emit PlayerStatsUpdated(player, kills, deaths, score);
    }
}