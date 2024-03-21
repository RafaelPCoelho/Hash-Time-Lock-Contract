const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = ['bcf904484a542d8b97a078cfbcee2799e1a1bc2fb435351707ec7f5e2a92cdad','8fd66c5afa2f7796766111fa72adae1b4b01e5044f5587e868ccf77611d0a5fc'];
module.exports = {
  networks: {
    sepolia: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://eth-sepolia.g.alchemy.com/v2/Yxp98hWF4yjIovcacpMThU6zHrbolj9Y")
      },
      network_id: 11155111,
      timeoutBlocks: 2000,
    },
    mumbai: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://polygon-mumbai.g.alchemy.com/v2/F6kHODuzePAi8ySmfssr-UR_Pt4aJpSW")
      },
      network_id: 80001,
      timeoutBlocks: 2000,
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.20",
    }
  },
};


