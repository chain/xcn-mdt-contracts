const { web3 } = require("hardhat");

const deployed = {
  mdt: "0xD70415DA29074539643b91d08d00608411Ef9e38",
  xcn: "0x33D9969F0C5d5a98523d2ce15056C61F85f37eD3",
  swap: "0xD073e9dADC01bBc4710573bC5fc1E0b04f64EA9A",
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
