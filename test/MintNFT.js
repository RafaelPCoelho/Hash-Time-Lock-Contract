require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");




describe("NFT Deploy and Mint", function () {
    let TokenSepolia, TokenArbitrum;
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;

    before(async function () {
        // Set up the provider for Sepolia
        const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
        //const sepoliaProvider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
        sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
        console.log(`Fazendo o deploy do contrato na conta: ${sepoliaWallet.address}`)

        // Set up the provider for Arbitrum Sepolia
        const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
        //const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

        // Contract Factory
        const Token = await ethers.getContractFactory('TesteHTLC');
        
        // Deploy contract on Sepolia
        const TokenSepolia = Token.connect(sepoliaWallet);
        tokenSepolia = await TokenSepolia.deploy(sepoliaWallet.address);
        console.log('Contract deployed on Sepolia at:', await tokenSepolia.getAddress());

        await new Promise(resolve => setTimeout(resolve, 5000)); // 10 segundos de espera para redes publicas

        // Deploy contract on Arbitrum Sepolia
        const TokenArbitrum = Token.connect(arbitrumWallet);
        tokenArbitrum = await TokenArbitrum.deploy(arbitrumWallet.address);
        console.log('Contract deployed on Arbitrum Sepolia at:', await tokenArbitrum.getAddress());
    });

    it("should mint NFT on Sepolia", async function () {
      const tokenIdSepolia = 0;
      console.log('Attempting to mint NFT on Sepolia');
      try {
          const txMintSepolia = await tokenSepolia.safeMint(sepoliaWallet.address, tokenIdSepolia);
          await txMintSepolia.wait();

          await new Promise(resolve => setTimeout(resolve, 1000)); // 10 segundos de espera para redes publicas

          console.log(`Minted NFT on Sepolia: Contract ${tokenSepolia.address}, Token ID ${tokenIdSepolia}`);

          // Check the owner of the minted NFT
          const owner = await tokenSepolia.ownerOf(tokenIdSepolia);
          expect(owner).to.equal(sepoliaWallet.address);
      } catch (error) {
          console.error('Failed to mint NFT on Sepolia:', error);
      }
  });

  it("should mint NFT on Arbitrum Sepolia", async function () {
      const tokenIdArbitrum = 1;
      console.log('Attempting to mint NFT on Arbitrum Sepolia');
      try {
          const txMintArbitrum = await tokenArbitrum.safeMint(arbitrumWallet.address, tokenIdArbitrum);
          await txMintArbitrum.wait();
          console.log(`Minted NFT on Arbitrum Sepolia: Contract ${tokenArbitrum.address}, Token ID ${tokenIdArbitrum}`);

          // Check the owner of the minted NFT
          const owner = await tokenArbitrum.ownerOf(tokenIdArbitrum);
          expect(owner).to.equal(arbitrumWallet.address);
      } catch (error) {
          console.error('Failed to mint NFT on Arbitrum Sepolia:', error);
      }
  });
});
