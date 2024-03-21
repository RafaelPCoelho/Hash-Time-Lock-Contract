const HDWalletProvider = require('@truffle/hdwallet-provider');

const mnemonic = ['0xd691bcf1f080d2f602503119e6c1c6d16ab9fe412e71777098268f9b95889b5a','0xa1e85e8f4e926a8a3ab643339389cd0b94be4d39c7012b1f0c93e63f2f16d908'];
module.exports = {
  networks: {
    chocolate: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "HTTP://127.0.0.1:7545")
      },
      network_id: 5777,
      timeoutBlocks: 2000,
    },
    morango: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "HTTP://127.0.0.1:7555")
      },
      network_id: 5755,
      timeoutBlocks: 2000,
    },
  },
  mocha: {},
  compilers: {
    solc: {
      version: "0.8.0",
    }
  },
};


