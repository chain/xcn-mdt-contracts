// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "hardhat/console.sol";

contract Swap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public mdtToken; // Address of MDT token contract
    IERC20 public xcnToken; // Address of XCN token contract

    event NewSwap(address indexed addr, uint256 indexed mdtAmount, uint256 indexed xcnAmount);

    constructor(IERC20 mdtToken_, IERC20 xcnToken_) {
        mdtToken = mdtToken_;
        xcnToken = xcnToken_;
    }

    // Swap MDT to XCN
    function swap(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Invalid amount");
        mdtToken.safeTransferFrom(
            address(msg.sender),
            address(0x000000000000000000000000000000000000dEaD),
            _amount
        );
        xcnToken.safeTransfer(address(msg.sender), _amount);

        emit NewSwap(msg.sender, _amount, _amount);
    }
}