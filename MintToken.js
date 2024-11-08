require('dotenv').config();
const { ethers } = require("hardhat");

async function deployAndMintTokens() {

    // Configuração para Amoy
    //const amoyProvider = new ethers.AlchemyProvider(`${process.env.ALCHEMY_API_KEY}`);
    const amoyProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    const amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, amoyProvider);

    // Configuração para Arbitrum
    //const arbitrumProvider = new ethers.AlchemyProvider(`${process.env.ALCHEMY_API_KEY}`);
    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    const arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    // Deploy do contrato ERC-20 em Amoy
    const Token = await ethers.getContractFactory("Token");
    const tokenAmoy = await Token.connect(amoyWallet).deploy("AmoyToken", "SPT");
    console.log("Token Amoy deployado em:", await tokenAmoy.getAddress());

    // Deploy do contrato ERC-20 em Arbitrum
    const tokenArbitrum = await Token.connect(arbitrumWallet).deploy("ArbitrumToken", "ART");
    console.log("Token Arbitrum deployado em:", await tokenArbitrum.getAddress());
}

deployAndMintTokens().catch((error) => {
    console.error(error);
    process.exit(1);
});