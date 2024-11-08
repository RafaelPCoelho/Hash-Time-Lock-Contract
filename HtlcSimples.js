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
    tokenAmoy = await ethers.getContractAt("Token", "0x82de6D156D64444656E40Bbbba4086A06d53aC58", amoyWallet);
    tokenArbitrum = await ethers.getContractAt("Token", "0x7204F76d2CEC11785346eeF6fe0796bf303B5F53", arbitrumWallet);

    // Aprovar o HTLC para transferir tokens no valor especificado
    const amount = ethers.parseUnits("10", 18); // 10 tokens

    // Deploy do contrato HTLC para ambas as redes
    const HTLC = await ethers.getContractFactory("HTLC");

    htlcAmoy = await HTLC.connect(amoyWallet).deploy(arbitrumWallet.address, tokenAmoy.getAddress(), amount);
    console.log("HTLC deployado em Amoy:", await htlcAmoy.getAddress());

    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(amoyWallet.address, tokenArbitrum.getAddress(), amount);
    console.log("HTLC deployado em Arbitrum:", await htlcArbitrum.getAddress());

    // Interações com o HTLC
    await htlcAmoy.connect(amoyWallet).fund();
    await htlcArbitrum.connect(arbitrumWallet).fund();

    console.log("Tokens depositados nos contratos HTLC");

    // Interação de retirada
    await htlcAmoy.connect(arbitrumWallet).withdraw(secret);
    await htlcArbitrum.connect(amoyWallet).withdraw(secret);

    console.log("Tokens retirados dos contratos HTLC");

    // Interação de reembolso (se necessário)
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > (await htlcAmoy.startTime()).toNumber() + (await htlcAmoy.lockTime()).toNumber()) {
        await htlcAmoy.connect(amoyWallet).refund();
        console.log("Tokens reembolsados para o dono em Amoy");
    }

    if (currentTime > (await htlcArbitrum.startTime()).toNumber() + (await htlcArbitrum.lockTime()).toNumber()) {
        await htlcArbitrum.connect(arbitrumWallet).refund();
        console.log("Tokens reembolsados para o dono em Arbitrum");
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
