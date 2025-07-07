const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Voting = await hre.ethers.getContractFactory("EncryptedVoting");
  
  // Deploy the contract
  const voting = await Voting.deploy();
  
  // Wait for deployment to complete
  await voting.waitForDeployment();
  
  // Get the contract address
  const contractAddress = await voting.getAddress();
  
  console.log("Voting contract deployed to:", contractAddress);
  
  return contractAddress;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});