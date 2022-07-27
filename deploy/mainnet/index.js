const { web3 } = require("hardhat");

const deployed = {
  mdt: "0x814e0908b12A99FeCf5BC101bB5d0b8B5cDf7d26",
  xcn: "0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18",
  swap: "",
};

const func = async function (hre) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { get, deploy, read, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  // /////////////////////// deploy starts
  const xcn = deployed.xcn
    ? { address: deployed.xcn }
    : await deploy("Chain", { from: deployer, log: true, args: [] });

  const mdt = deployed.mdt
    ? { address: deployed.mdt }
    : await deploy("MDToken", { from: deployer, log: true, args: [deployer, deployer, deployer, deployer, deployer, ethers.utils.parseEther('1000'), ethers.utils.parseEther('1000')] });

  // deploy swap
  const swap = deployed.swap
    ? { address: deployed.swap }
    : await deploy("Swap", { from: deployer, log: true, args: [mdt.address, xcn.address] });
};

func.tags = ["xcn"];
module.exports = func;
