require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;

    // Set up the provider for Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    console.log(`Deploying contract from account: ${sepoliaWallet.address}`);

    // Set up the provider for Arbitrum Sepolia
    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    // Contract Factory
    const Token = await ethers.getContractFactory('TesteHTLC');

    // Deploy contract on Sepolia
    const TokenSepolia = Token.connect(sepoliaWallet);
    tokenSepolia = await TokenSepolia.deploy(sepoliaWallet.address);
    console.log('Contract deployed on Sepolia at:', await tokenSepolia.getAddress());

    // Deploy contract on Arbitrum Sepolia
    const TokenArbitrum = Token.connect(arbitrumWallet);
    tokenArbitrum = await TokenArbitrum.deploy(arbitrumWallet.address);
    console.log('Contract deployed on Arbitrum Sepolia at:', await tokenArbitrum.getAddress());

    // Mint NFTs
    const tokenIdSepolia = 0;
    const tokenIdArbitrum = 1;

    try {
        const txMintSepolia = await tokenSepolia.safeMint(sepoliaWallet.address, tokenIdSepolia);
        await txMintSepolia.wait();
        console.log(`Minted NFT on Sepolia: Token ID ${tokenIdSepolia}`);
    } catch (error) {
        console.error('Failed to mint NFT on Sepolia:', error);
    }

    try {
        const txMintArbitrum = await tokenArbitrum.safeMint(arbitrumWallet.address, tokenIdArbitrum);
        await txMintArbitrum.wait();
        console.log(`Minted NFT on Arbitrum Sepolia: Token ID ${tokenIdArbitrum}`);
    } catch (error) {
        console.error('Failed to mint NFT on Arbitrum Sepolia:', error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
