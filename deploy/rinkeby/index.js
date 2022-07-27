const { web3 } = require("hardhat");

const deployed = {
  mdt: "0xD70415DA29074539643b91d08d00608411Ef9e38",
  xcn: "0x33D9969F0C5d5a98523d2ce15056C61F85f37eD3",
  swap: "0x2FD7BFC63C6669a8876323c43930f77f6E6a92B4",
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
