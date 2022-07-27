const { web3 } = require("hardhat");

const deployed = {
  mdt: "0x668DB7aa38eaC6B40c9D13dBE61361DC4c4611d1",
  xcn: "0x7324c7C0d95CEBC73eEa7E85CbAac0dBdf88a05b",
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
