// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "hardhat/console.sol";

contract Swap is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public mdtToken; // Address of MDT token contract
    IERC20 public xcnToken; // Address of XCN token contract

    uint256 public mdtPrice = 1000000000000000000; // 1 XCN = 1 MDT
    uint256 public constant PRICE_DECIMALS = 18;

    event NewSwap(address indexed addr, uint256 indexed mdtAmount, uint256 indexed xcnAmount);
    event Withdraw(address indexed addr, uint256 amount);
    event PriceChanged(uint256 price);

    constructor(IERC20 mdtToken_, IERC20 xcnToken_) {
        mdtToken = mdtToken_;
        xcnToken = xcnToken_;
    }

    // Swap MDT to XCN
    function swap(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Invalid amount");
        mdtToken.safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );
        uint256 _xcnAmount = _amount.mul(mdtPrice).div(10**PRICE_DECIMALS); // Same decimals, and MDT = 0.5 XCN
        xcnToken.safeTransfer(address(msg.sender), _xcnAmount);

        emit NewSwap(msg.sender, _amount, _xcnAmount);
    }

    // Withdraw deposited MDT Token
    function withdraw() public onlyOwner {
        uint256 _amount = mdtToken.balanceOf(address(this));
        require(_amount > 0, "No balance");
        mdtToken.safeTransfer(address(msg.sender), _amount);

        emit Withdraw(msg.sender, _amount);
    }

    // Update MDT-XCN Swap Price
    function setPrice(uint256 _price) public onlyOwner {
        require(_price > 0, "Invalid price");
        mdtPrice = _price;
        emit PriceChanged(_price);
    }
}
