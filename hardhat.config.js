require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20", // For your EncryptedVoting.sol
      },
      {
        version: "0.8.28", // For Lock.sol
      }
    ]
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};