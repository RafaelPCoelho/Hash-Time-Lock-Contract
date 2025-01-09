require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      //url:"HTTP://127.0.0.1:7555",
      url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      //chainId:5778,
      chainId: 80002,
      accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2],
    },
    arbitrum: {
      //url: "HTTP://127.0.0.1:7545",
      url: `https://avax-fuji.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      //chainId:5779,
      chainId: 43113,
      accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2],
    },
  },
};