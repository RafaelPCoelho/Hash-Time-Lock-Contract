require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    let amoyWallet, arbitrumWallet;
    let tokenAmoy, tokenArbitrum;
    let htlcAmoy, htlcArbitrum;

    const secret = "abracadabra";

    // Configuração para Amoy
    //const amoyProvider = new ethers.AlchemyProvider(`${process.env.ALCHEMY_API_KEY}`);
    const amoyProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1,amoyProvider);

    // Configuração para Arbitrum
    //const arbitrumProvider = new ethers.AlchemyProvider(`${process.env.ALCHEMY_API_KEY}`);
    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    // Contratos ERC-20 (endereços são exemplos)
    tokenAmoy = await ethers.getContractAt("Token", "0x0c4006414168cd3e3bA8e33E0cDD3A1F695737Bd", amoyWallet);
    tokenArbitrum = await ethers.getContractAt("Token", "0xBE5B3e20B0b168af42c43cA529d7952AF74f0E67", arbitrumWallet);

    // Aprovar o HTLC para transferir tokens no valor especificado
    const amount = '1';

    // Deploy do contrato HTLC para ambas as redes
    const HTLC = await ethers.getContractFactory("HTLC");

    htlcAmoy = await HTLC.connect(amoyWallet).deploy(arbitrumWallet.address, tokenAmoy.getAddress(), amount);
    console.log("HTLC deployado em Amoy:", await htlcAmoy.getAddress());

    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(amoyWallet.address, tokenArbitrum.getAddress(), amount);
    console.log("HTLC deployado em Arbitrum:", await htlcArbitrum.getAddress());


    //Faz o aprove
    await tokenAmoy.connect(amoyWallet).approve(htlcAmoy.getAddress(), amount);
    console.log("HTLC Aprovado na Amoy");

    await new Promise(resolve => setTimeout(resolve, 1000));

    await tokenArbitrum.connect(arbitrumWallet).approve(htlcArbitrum.getAddress(), amount);
    console.log("HTLC Aprovado na Arbitrum");

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Interações com o HTLC
    await htlcAmoy.connect(amoyWallet).fund();
    await htlcArbitrum.connect(arbitrumWallet).fund();

    console.log("Tokens depositados nos contratos HTLC");

    // Interação de retirada
    await new Promise(resolve => setTimeout(resolve, 1000));

    await htlcAmoy.connect(arbitrumWallet).withdraw(secret);
    await htlcArbitrum.connect(amoyWallet).withdraw(secret);

    console.log("Tokens retirados dos contratos HTLC");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
