require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;
    let htlcSepolia, htlcArbitrum;
    let flip;

    // Função para registrar os custos de gás no arquivo
    function saveGasCosts(description, gasUsed) {
        const data = `${description}: ${ethers.formatUnits(gasUsed, 'gwei')} gwei\n`;
        fs.appendFileSync('custosHTLC.txt', data, (err) => {
            if (err) throw err;
        });
    }

    async function checkNFTBalance(contract, wallet) { 
        const balance = await contract.connect(wallet).balanceOf(wallet.address); 
        console.log(`Wallet ${wallet.address} has ${balance.toString()} NFTs in contract ${await contract.getAddress()}`);
        return balance;
    }

    async function handleHTLCInteraction(htlcContract, wallet, secret, tokenContract) {
        try {
            const startTime = await htlcContract.startTime();
            const lockTime = await htlcContract.lockTime();
            let tx, txReceipt;
    
            if (Date.now() / 1000 > startTime + lockTime) {
                console.log(`Lock time expired. Attempting refund...`);
                tx = await htlcContract.connect(wallet).refund();
                txReceipt = await tx.wait(); // Wait for transaction confirmation
                console.log(`NFT refunded to the original owner.`);
            } else {
                console.log(`Lock time still valid. Attempting withdrawal...`);
                tx = await htlcContract.connect(wallet).withdraw(secret);
                txReceipt = await tx.wait(); // Wait for transaction confirmation
                console.log(`NFT withdrawn successfully.`);
            }
    
            const gasUsed = txReceipt.gasUsed;
            console.log(`Gas Fee: ${ethers.formatUnits(gasUsed, 'gwei')} gwei`);

            console.log(`Gas Fee: ${ethers.formatUnits(gasUsed, 'gwei')} gwei`);

            // Salva o custo de gás no arquivo
            saveGasCosts('HTLC Interaction Gas Fee', gasUsed);
    
            await checkNFTBalance(tokenContract, wallet); // Verifica o saldo após a interação com o HTLC
        } catch (error) {
            console.error(`Failed to interact with HTLC contract: ${error}`);
        }
    }

    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);

    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    const Token = await ethers.getContractFactory('TesteHTLC');
    tokenSepolia = Token.attach("0x3E97f42C6b0266cD95FAf38238c9CE53AA9D55f4");  
    tokenArbitrum = Token.attach("0xc743fA75Bf9519341816060a8685E68CA59e200F"); 

    const ownerTokenSepolia = await tokenSepolia.connect(sepoliaWallet).ownerOf(0);
    const ownerTokenArbitrum = await tokenArbitrum.connect(arbitrumWallet).ownerOf(1);

    if (ownerTokenSepolia == sepoliaWallet.address && ownerTokenArbitrum == arbitrumWallet.address){
        flip = 0;
    }
    else if (ownerTokenSepolia == arbitrumWallet.address && ownerTokenArbitrum == sepoliaWallet.address){
        flip = 1;
        sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, sepoliaProvider);
    }
    else {
        console.log("ERRO NO FLIP, NÃO EXISTE OWNER NAS CARTEIRAS OU EM UMA")
        process.exit(0);
    }

    console.log(`O flip atual é: ${flip}`);

    console.log(`Dono da Token Sepolia: ${ownerTokenSepolia}`);
    console.log(`Dono da Token Arbitrum: ${ownerTokenArbitrum}`);
    
    const HTLC = await ethers.getContractFactory('HTLC');
    let sepoliaDeployed, arbitrumDeployed;

    if (flip == 0) {
        htlcSepolia = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenSepolia.getAddress(), 0); 
        sepoliaDeployed = await htlcSepolia.deploymentTransaction().wait(); 
        htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenArbitrum.getAddress(), 1); 
        arbitrumDeployed = await htlcArbitrum.deploymentTransaction().wait();
    } else if (flip == 1) {
        htlcSepolia = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenSepolia.getAddress(), 0); 
        sepoliaDeployed = await htlcSepolia.deploymentTransaction().wait();
        htlcArbitrum = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenArbitrum.getAddress(), 1); 
        arbitrumDeployed = await htlcArbitrum.deploymentTransaction().wait();
    }

    console.log('HTLC deployed on Sepolia at:', await htlcSepolia.getAddress());
    console.log('HTLC deployed on Arbitrum at:', await htlcArbitrum.getAddress());

    let sepoliaGasUsedDeploy = sepoliaDeployed.gasUsed;
    let arbitrumGasUsedDeploy = arbitrumDeployed.gasUsed;

    console.log(`Sepolia Gas Fee: ${ethers.formatUnits(sepoliaGasUsedDeploy, 'gwei')} gwei`);
    console.log(`Arbitrum Gas Fee: ${ethers.formatUnits(arbitrumGasUsedDeploy, 'gwei')} gwei`);

    saveGasCosts('Sepolia Gas Fee (Deploy)', sepoliaGasUsedDeploy);
    saveGasCosts('Arbitrum Gas Fee (Deploy)', arbitrumGasUsedDeploy);

    await new Promise(resolve => setTimeout(resolve, 5000));

    let sepoliaApprovalTransaction, arbitrumApprovalTransaction, sepoliaApprovalReceipt, arbitrumApprovalReceipt;

    if (flip == 0) {
        sepoliaApprovalTransaction = await tokenSepolia.connect(sepoliaWallet).setApprovalForAll(await htlcSepolia.getAddress(), true);
        sepoliaApprovalReceipt = await sepoliaApprovalTransaction.wait();
        arbitrumApprovalTransaction = await tokenArbitrum.connect(arbitrumWallet).setApprovalForAll(await htlcArbitrum.getAddress(), true);
        arbitrumApprovalReceipt = await arbitrumApprovalTransaction.wait();
    } else if (flip == 1) {
        sepoliaApprovalTransaction = await tokenSepolia.connect(arbitrumWallet).setApprovalForAll(await htlcSepolia.getAddress(), true);
        sepoliaApprovalReceipt = await sepoliaApprovalTransaction.wait(); 
        arbitrumApprovalTransaction = await tokenArbitrum.connect(sepoliaWallet).setApprovalForAll(await htlcArbitrum.getAddress(), true);
        arbitrumApprovalReceipt = await arbitrumApprovalTransaction.wait();
    }

    if (flip == 0){
        await checkNFTBalance(tokenSepolia, sepoliaWallet);
        await checkNFTBalance(tokenArbitrum, arbitrumWallet);
        }
        else if(flip == 1){
        await checkNFTBalance(tokenArbitrum, sepoliaWallet);
        await checkNFTBalance(tokenSepolia, arbitrumWallet);
        }

    const sepoliaGasUsedApprovalForAll = sepoliaApprovalReceipt.gasUsed;
    const arbitrumGasUsedApprovalForAll = arbitrumApprovalReceipt.gasUsed;

    console.log(`Sepolia Gas Fee ApprovalTransaction: ${ethers.formatUnits(sepoliaGasUsedApprovalForAll, 'gwei')} gwei`);
    console.log(`Arbitrum Gas Fee ApprovalTransaction: ${ethers.formatUnits(arbitrumGasUsedApprovalForAll, 'gwei')} gwei`);

    saveGasCosts('Sepolia Gas Fee (Approval)', sepoliaGasUsedApprovalForAll);
    saveGasCosts('Arbitrum Gas Fee (Approval)', arbitrumGasUsedApprovalForAll);

    await new Promise(resolve => setTimeout(resolve, 5000));

    let sepoliaFundTransaction, arbitrumFundTransaction, sepoliaFundReceipt, arbitrumFundReceipt;

    if (flip == 0) {
        sepoliaFundTransaction = await htlcSepolia.connect(sepoliaWallet).fund();
        sepoliaFundReceipt = await sepoliaFundTransaction.wait();
        arbitrumFundTransaction = await htlcArbitrum.connect(arbitrumWallet).fund();
        arbitrumFundReceipt = await arbitrumFundTransaction.wait();
    } else if (flip == 1) {
        sepoliaFundTransaction = await htlcSepolia.connect(arbitrumWallet).fund();
        sepoliaFundReceipt = await sepoliaFundTransaction.wait();
        arbitrumFundTransaction = await htlcArbitrum.connect(sepoliaWallet).fund();
        arbitrumFundReceipt = await arbitrumFundTransaction.wait();
    }

    console.log('NFTs funded to HTLC contracts.');

    const sepoliaGasUsedFund = sepoliaFundReceipt.gasUsed;
    const arbitrumGasUsedFund = arbitrumFundReceipt.gasUsed;

    console.log(`Sepolia Gas Fee FundTransaction: ${ethers.formatUnits(sepoliaGasUsedFund, 'gwei')} gwei`);
    console.log(`Arbitrum Gas Fee FundTransaction: ${ethers.formatUnits(arbitrumGasUsedFund, 'gwei')} gwei`);

    saveGasCosts('Sepolia Gas Fee (Fund)', sepoliaGasUsedFund);
    saveGasCosts('Arbitrum Gas Fee (Fund)', arbitrumGasUsedFund);

    if (flip == 0){
        await checkNFTBalance(tokenSepolia, sepoliaWallet);
        await checkNFTBalance(tokenArbitrum, arbitrumWallet);
        }
        else if(flip == 1){
        await checkNFTBalance(tokenArbitrum, sepoliaWallet);
        await checkNFTBalance(tokenSepolia, arbitrumWallet);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    const secret = 'abracadabra';

    if (flip == 0){
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, sepoliaProvider);
        await handleHTLCInteraction(htlcSepolia, arbitrumWallet, secret, tokenSepolia);

        sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
        await handleHTLCInteraction(htlcArbitrum, sepoliaWallet, secret, tokenArbitrum);
    }
    else if(flip ==1){
        sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
        await handleHTLCInteraction(htlcSepolia, sepoliaWallet, secret, tokenSepolia);

        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);
        await handleHTLCInteraction(htlcArbitrum, arbitrumWallet, secret, tokenArbitrum);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
