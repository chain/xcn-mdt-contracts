const { web3 } = require("hardhat");

const deployed = {
  mdt: "0x750C741a16DfC3E1F858B97c06DDc2BDf745a7FC",
  xcn: "0x028C0e9baAbEf385971120aD3C66992a2db162FD",
  swap: "0x0ece5312f66002b4103FBb6A0ff4ad90aF52f91a",
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
