require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');

const quebra = `\n`;

const virgula = ',';

const nowDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ',')

fs.appendFileSync('custosHTLC20.txt', quebra, (err) => {
    if (err) throw err;
});

fs.appendFileSync('custosHTLC20.txt', nowDate, (err) => {
    if (err) throw err;
});

function saveGasCosts(x,espacamento) {
    const data = `${ethers.formatUnits(x, 'wei')}${espacamento}`;
    fs.appendFileSync('custosHTLC20.txt', data, (err) => {
        if (err) throw err;
    });
}

async function main() {
    let amoyWallet, arbitrumWallet;
    let tokenAmoy, tokenArbitrum;
    let htlcAmoy, htlcArbitrum;
    let amoyDeployed, arbitrumDeployed;
    let amoyStartTime, amoyEndTime, amoyTime;
    let arbitrumStartTime, arbitrumEndTime, arbitrumTime;
    let amoyApprovalTransaction, arbitrumApprovalTransaction, amoyApprovalReceipt, arbitrumApprovalReceipt;
    let amoyFundTransaction, arbitrumFundTransaction, amoyFundReceipt, arbitrumFundReceipt;
    let amoyWithdrawTransaction, arbitrumWithdrawTransaction, amoyWithdrawReceipt, arbitrumWithdrawReceipt;

    const secret = "abracadabra";

    // Configuração para Amoy
    const amoyProvider = new ethers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    //const amoyProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1,amoyProvider);

    // Configuração para Arbitrum
    const arbitrumProvider = new ethers.JsonRpcProvider(`https://avax-fuji.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    //const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    // Contratos ERC-20 (endereços são exemplos)
    tokenAmoy = await ethers.getContractAt("Token", "0xda875d7DF75EB0B664E5F64B8876B74B7F81CC23", amoyWallet);
    tokenArbitrum = await ethers.getContractAt("Token", "0x58EBd3F466d2bDec3D44614762BC1E199c1B9385", arbitrumWallet);

    // Aprovar o HTLC para transferir tokens no valor especificado
    const amount = '1';

    // Deploy do contrato HTLC para ambas as redes
    const HTLC = await ethers.getContractFactory("HTLC");

    amoyStartTime = Date.now();
    htlcAmoy = await HTLC.connect(amoyWallet).deploy(arbitrumWallet.address, tokenAmoy.getAddress(), amount);
    amoyDeployed = await htlcAmoy.deploymentTransaction().wait();
    amoyEndTime = Date.now();
    console.log("HTLC deployado em Amoy:", await htlcAmoy.getAddress());

    arbitrumStartTime = Date.now();
    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(amoyWallet.address, tokenArbitrum.getAddress(), amount);
    arbitrumDeployed = await htlcArbitrum.deploymentTransaction().wait();
    arbitrumEndTime = Date.now();
    console.log("HTLC deployado em Arbitrum:", await htlcArbitrum.getAddress());

    let amoyGasUsedDeploy = amoyDeployed.gasUsed;
    let amoyGasPriceDeploy = amoyDeployed.gasPrice;

    let arbitrumGasUsedDeploy = arbitrumDeployed.gasUsed;
    let arbitrumGasPriceDeploy = arbitrumDeployed.gasPrice;

    amoyTime = (amoyEndTime - amoyStartTime);
    arbitrumTime = (arbitrumEndTime - arbitrumStartTime);


    console.log(`Amoy Gas Fee: ${ethers.formatUnits(amoyGasUsedDeploy,'wei')} wei`);
    console.log(`Arbitrum Gas Fee: ${ethers.formatUnits(arbitrumGasUsedDeploy, 'wei')} wei`);

    console.log(`Amoy Gas Price: ${ethers.formatUnits(amoyGasPriceDeploy, 'wei')} wei`);
    console.log(`Arbitrum Gas Price: ${ethers.formatUnits(arbitrumGasPriceDeploy, 'wei')} wei`);

    console.log("HTLCAmoy deployed time:", amoyTime);
    console.log("HTLCArbitrum deployed time:", arbitrumTime);

    saveGasCosts(amoyGasUsedDeploy,virgula);
    saveGasCosts(amoyGasPriceDeploy,virgula);
    saveGasCosts(amoyTime,virgula);
    
    saveGasCosts(arbitrumGasUsedDeploy,virgula);
    saveGasCosts(arbitrumGasPriceDeploy,virgula);
    saveGasCosts(arbitrumTime,virgula);

    //Faz o aprove
    amoyStartTime = Date.now();
    amoyApprovalTransaction = await tokenAmoy.connect(amoyWallet).approve(htlcAmoy.getAddress(), amount);
    amoyApprovalReceipt = await amoyApprovalTransaction.wait();
    amoyEndTime = Date.now();
    console.log("HTLC Aprovado na Amoy");

    arbitrumStartTime = Date.now();
    arbitrumApprovalTransaction = await tokenArbitrum.connect(arbitrumWallet).approve(htlcArbitrum.getAddress(), amount);
    arbitrumApprovalReceipt = await arbitrumApprovalTransaction.wait();
    arbitrumEndTime = Date.now();
    console.log("HTLC Aprovado na Arbitrum");

    const amoyGasUsedApprovalForAll = amoyApprovalReceipt.gasUsed;
    const amoyGasPriceApprovalForAll = amoyApprovalReceipt.gasPrice;

    const arbitrumGasUsedApprovalForAll = arbitrumApprovalReceipt.gasUsed;
    const arbitrumGasPriceApprovalForAll = arbitrumApprovalReceipt.gasPrice;

    amoyTime = (amoyEndTime - amoyStartTime);
    arbitrumTime = (arbitrumEndTime - arbitrumStartTime);

    console.log(`Amoy Gas Fee ApprovalTransaction: ${ethers.formatUnits(amoyGasUsedApprovalForAll, 'wei')} wei`);
    console.log(`Arbitrum Gas Fee ApprovalTransaction: ${ethers.formatUnits(arbitrumGasUsedApprovalForAll, 'wei')} wei`);

    console.log(`Amoy Gas Price ApprovalTransaction: ${ethers.formatUnits(amoyGasPriceApprovalForAll, 'wei')} wei`);
    console.log(`Arbitrum Gas Price ApprovalTransaction: ${ethers.formatUnits(arbitrumGasPriceApprovalForAll, 'wei')} wei`);

    console.log("Amoy ApprovalTransaction time:", amoyTime);
    console.log("Arbitrum ApprovalTransaction time:", arbitrumTime);

    saveGasCosts(amoyGasUsedApprovalForAll, virgula);
    saveGasCosts(amoyGasPriceApprovalForAll, virgula);
    saveGasCosts(amoyTime, virgula);

    saveGasCosts(arbitrumGasUsedApprovalForAll, virgula);
    saveGasCosts(arbitrumGasPriceApprovalForAll, virgula);
    saveGasCosts(arbitrumTime, virgula);

    // Interações com o HTLC
    amoyStartTime = Date.now();
    amoyFundTransaction = await htlcAmoy.connect(amoyWallet).fund();
    amoyFundReceipt = await amoyFundTransaction.wait();
    amoyEndTime = Date.now();
    arbitrumStartTime = Date.now();
    arbitrumFundTransaction = await htlcArbitrum.connect(arbitrumWallet).fund();
    arbitrumFundReceipt = await arbitrumFundTransaction.wait();
    arbitrumEndTime = Date.now();

    console.log("Tokens depositados nos contratos HTLC");

    console.log("Verificação dos fund:");
    console.log(`Saldo conta 1: ${await tokenAmoy.balanceOf(amoyWallet.address)}`);
    console.log(`Saldo conta 2: ${await tokenArbitrum.balanceOf(arbitrumWallet.address)}`);

    const amoyGasUsedFund = amoyFundReceipt.gasUsed;
    const amoyGasPriceFund = amoyFundReceipt.gasPrice;
    
    const arbitrumGasUsedFund = arbitrumFundReceipt.gasUsed;
    const arbitrumGasPriceFund = arbitrumFundReceipt.gasPrice;

    amoyTime = (amoyEndTime - amoyStartTime);
    arbitrumTime = (arbitrumEndTime - arbitrumStartTime);

    console.log(`Amoy Gas Fee FundTransaction: ${ethers.formatUnits(amoyGasUsedFund, 'wei')} wei`);
    console.log(`Arbitrum Gas Fee FundTransaction: ${ethers.formatUnits(arbitrumGasUsedFund, 'wei')} wei`);
    
    console.log(`Amoy Gas Price FundTransaction: ${ethers.formatUnits(amoyGasPriceFund, 'wei')} wei`);
    console.log(`Arbitrum Gas Price FundTransaction: ${ethers.formatUnits(arbitrumGasPriceFund, 'wei')} wei`);

    console.log("Amoy FundTransaction time:", amoyTime);
    console.log("Arbitrum FundTransaction time:", arbitrumTime);
    
    saveGasCosts(amoyGasUsedFund, virgula);  
    saveGasCosts(amoyGasPriceFund, virgula);
    saveGasCosts(amoyTime, virgula);

    saveGasCosts(arbitrumGasUsedFund, virgula);
    saveGasCosts( arbitrumGasPriceFund, virgula);
    saveGasCosts(arbitrumTime, virgula);

    // Interação de retirada
    await new Promise(resolve => setTimeout(resolve, 5000));

    amoyStartTime = Date.now();
    amoyWithdrawTransaction = await htlcAmoy.withdraw("abracadabra");
    amoyWithdrawReceipt = await amoyWithdrawTransaction.wait();
    amoyEndTime = Date.now();
    arbitrumStartTime = Date.now();
    arbitrumWithdrawTransaction = await htlcArbitrum.withdraw("abracadabra");
    arbitrumWithdrawReceipt = await arbitrumWithdrawTransaction.wait();
    arbitrumEndTime = Date.now();

    const amoyGasUsedWithdraw = amoyWithdrawReceipt.gasUsed;
    const amoyGasPriceWithdraw = amoyWithdrawReceipt.gasPrice;
    
    const arbitrumGasUsedWithdraw = arbitrumWithdrawReceipt.gasUsed;
    const arbitrumGasPriceWithdraw = arbitrumWithdrawReceipt.gasPrice;

    amoyTime = (amoyEndTime - amoyStartTime);
    arbitrumTime = (arbitrumEndTime - arbitrumStartTime);

    console.log(`Amoy Gas Fee: ${ethers.formatUnits(amoyGasUsedWithdraw, 'wei')} wei`);
    console.log(`Arbitrum Gas Fee: ${ethers.formatUnits(arbitrumGasUsedWithdraw, 'wei')} wei`);

    console.log(`Amoy Gas Price: ${ethers.formatUnits(amoyGasPriceWithdraw, 'wei')} wei`);
    console.log(`Arbitrum Gas Price: ${ethers.formatUnits(arbitrumGasPriceWithdraw, 'wei')} wei`);

    console.log("HTLCAmoy withdraw time:", amoyTime);
    console.log("HTLCArbitrum withdraw time:", arbitrumTime);

    saveGasCosts(amoyGasUsedWithdraw, virgula);
    saveGasCosts(amoyGasPriceWithdraw, virgula);
    saveGasCosts(amoyTime, virgula);
    
    saveGasCosts(arbitrumGasUsedWithdraw, virgula);
    saveGasCosts(arbitrumGasPriceWithdraw, virgula);
    saveGasCosts(arbitrumTime,"");

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
