// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EduToken
 * @dev ERC-20 token for AI Adaptive 3D University rewards
 */
contract EduToken is ERC20, Ownable {
    // Total supply: 1,000,000 tokens (with 18 decimals)
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    
    // Weekly reward pool
    uint256 public constant WEEKLY_REWARD_PER_USER = 100 * 10**18;
    
    // Events
    event RewardsDistributed(address[] recipients, uint256 amount);
    
    /**
     * @dev Constructor that mints initial supply to the deployer
     */
    constructor() ERC20("EduToken", "EDU") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Distribute rewards to top 5 performers
     * @param recipients Array of addresses (must be exactly 5)
     */
    function distributeWeeklyRewards(address[] calldata recipients) external onlyOwner {
        require(recipients.length == 5, "Must have exactly 5 recipients");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            _transfer(owner(), recipients[i], WEEKLY_REWARD_PER_USER);
        }
        
        emit RewardsDistributed(recipients, WEEKLY_REWARD_PER_USER);
    }
    
    /**
     * @dev Mint additional tokens (only owner)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
