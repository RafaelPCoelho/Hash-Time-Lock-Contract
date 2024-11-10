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
    tokenAmoy = await ethers.getContractAt("Token", "0x1cca9dfc882718715e83d66449be8DBA8714D3f1", amoyWallet);
    tokenArbitrum = await ethers.getContractAt("Token", "0xA1439C9BBC2d890Dc4e7847f671107A607170771", arbitrumWallet);

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

    console.log("Verificação dos fund:");
    console.log(`Saldo conta 1: ${await tokenAmoy.balanceOf(amoyWallet.address)}`);
    console.log(`Saldo conta 2: ${await tokenArbitrum.balanceOf(arbitrumWallet.address)}`);

    // Interação de retirada
    await new Promise(resolve => setTimeout(resolve, 1000));

    await htlcAmoy.withdraw("abracadabra");
    await htlcArbitrum.withdraw("abracadabra");

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("Tokens retirados dos contratos HTLC");

    console.log("Verificação dos witdraw:");

    console.log(`Saldo do HTLC zerado na Amoy: ${await tokenAmoy.balanceOf(htlcAmoy.getAddress())}`);
    console.log(`Saldo do HTLC zerado na Arbitrum: ${await tokenArbitrum.balanceOf(htlcArbitrum.getAddress())}`);
    console.log(`---------------------------------`);
    console.log(`Saldo conta 2 recebido do token 1: ${await tokenAmoy.balanceOf(arbitrumWallet.address)}`);
    console.log(`Saldo conta 1 recebido do token 2: ${await tokenArbitrum.balanceOf(amoyWallet.address)}`);

}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
