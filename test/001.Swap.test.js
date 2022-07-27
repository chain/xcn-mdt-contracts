require("dotenv").config();
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, getNamedAccounts, web3 } = require("hardhat");
const { getBlockTimestamp, advanceTimeAndBlock }= require('./helpers/helpers');

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("MDT->XCN Swap Test", function () {
  const info = {
    xcn: "",
    mdt: "",
    swap: "",
  };
  
  before(async function () {
    const namedAccounts = await getNamedAccounts();
    info.deployer = namedAccounts.deployer;
    info.deployerSigner = await ethers.provider.getSigner(info.deployer);
    info.member1 = namedAccounts.member1;
    info.member1Signer = await ethers.provider.getSigner(info.member1);
    info.member2 = namedAccounts.member2;
    info.member2Signer = await ethers.provider.getSigner(info.member2);
  });

  it("Contract Deploy", async function () {
    const XCNFactory = await ethers.getContractFactory("Chain");
    info.xcn = await XCNFactory.deploy();

    const MDTFactory = await ethers.getContractFactory("MDToken");
    info.mdt = await MDTFactory.deploy(info.deployer, info.deployer, info.deployer, info.deployer, info.deployer, ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000'));
    // address _tokenSaleAddress,
    // address _mdtTeamAddress,
    // address _userGrowthAddress,
    // address _investorsAddress,
    // address _mdtFoundationAddress,
    // uint256 _presaleAmount,
    // uint256 _earlybirdAmount

    const SwapFactory = await ethers.getContractFactory("Swap");
    info.swap = await SwapFactory.deploy(info.mdt.address, info.xcn.address);
  });

  it("Check configs", async function () {
    // let _balance = await info.xcn.balanceOf(info.deployer);
    // console.log("xcn balance:", _balance.toString(10));
    expect(await info.xcn.balanceOf(info.deployer)).to.equal(ethers.utils.parseEther('21537311000'));
    expect(await info.mdt.owner()).to.equal(info.deployer);
    // _balance = await info.mdt.balanceOf(info.deployer);
    // console.log("mdt balance:", _balance.toString(10));
    expect(await info.mdt.balanceOf(info.deployer)).to.equal(ethers.utils.parseEther('1000000000'));
    expect(await info.swap.mdtToken()).to.equal(info.mdt.address);
    expect(await info.swap.xcnToken()).to.equal(info.xcn.address);
  });

  it("Check swap", async function () {
    // swap error: 0 amount
    await expect(
      info.swap.connect(info.member1Signer).swap(0)
    ).to.be.revertedWith('Invalid amount');

    // swap error: not enough mdt balance
    await expect(
      info.swap.connect(info.member1Signer).swap(ethers.utils.parseEther('1'))
    ).to.be.revertedWith("SafeERC20: low-level call failed");

    // swap error: not enough xcn balance
    await info.mdt.connect(info.deployerSigner).transfer(info.member1, ethers.utils.parseEther('1'))
    await expect(
      info.swap.connect(info.member1Signer).swap(ethers.utils.parseEther('1'))
    ).to.be.revertedWith("SafeERC20: low-level call failed");

    // send xcn balance to the contract
    await info.xcn.connect(info.deployerSigner).transfer(info.swap.address, ethers.utils.parseEther('0.5'));
    // swap error: mdt not approved
    await expect(
      info.swap.connect(info.member1Signer).swap(ethers.utils.parseEther('1'))
    ).to.be.revertedWith("SafeERC20: low-level call failed");

    // approve mdt to the swap contract
    await info.mdt.connect(info.member1Signer).approve(info.swap.address, ethers.utils.parseEther('1'));
    // swap success
    await expect(
      info.swap.connect(info.member1Signer).swap(ethers.utils.parseEther('1'))
    ).to.be.emit(info.swap, "NewSwap");
    expect(await info.mdt.balanceOf(info.swap.address)).to.equal(ethers.utils.parseEther('1'));
    expect(await info.xcn.balanceOf(info.swap.address)).to.equal(ethers.utils.parseEther('0'));

    // withdraw test
    await expect(
      info.swap.connect(info.member1Signer).withdraw()
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      info.swap.connect(info.deployerSigner).withdraw()
    ).to.be.emit(info.swap, "Withdraw");
    expect(await info.mdt.balanceOf(info.swap.address)).to.equal(ethers.utils.parseEther('0'));
    await expect(
      info.swap.connect(info.deployerSigner).withdraw()
    ).to.be.revertedWith("No balance");
  });
});
