require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    let amoyWallet, arbitrumWallet;
    let tokenamoy, tokenArbitrum;
    let htlcamoy, htlcArbitrum;
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

    async function handleHTLCInteraction(htlcContract, wallet, secret, tokenContract, provider) {
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
            if (provider == amoyProvider){
            saveGasCosts('Amoy Gas Fee (Withdraw)', gasUsed);
            }
            else if (provider == arbitrumProvider){
            saveGasCosts('Arbitrum Gas Fee (Withdraw)', gasUsed);
            }
    
            await checkNFTBalance(tokenContract, wallet); // Verifica o saldo após a interação com o HTLC
        } catch (error) {
            console.error(`Failed to interact with HTLC contract: ${error}`);
        }
    }

    const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const amoyProvider = new ethers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

    amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, amoyProvider);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    const Token = await ethers.getContractFactory('TesteHTLC');
    tokenamoy = Token.attach("0xdcA2d4CA80f5893051B2B78Aa92E4C9A7D687855");  
    tokenArbitrum = Token.attach("0x63c203C3a56A3f37AB68598b4E57b79D513cE0A4"); 

    const ownerTokenamoy = await tokenamoy.connect(amoyWallet).ownerOf(0);
    const ownerTokenArbitrum = await tokenArbitrum.connect(arbitrumWallet).ownerOf(1);

    if (ownerTokenamoy == amoyWallet.address && ownerTokenArbitrum == arbitrumWallet.address){
        flip = 0;
    }
    else if (ownerTokenamoy == arbitrumWallet.address && ownerTokenArbitrum == amoyWallet.address){
        flip = 1;
        amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, amoyProvider);
    }
    else {
        console.log("ERRO NO FLIP, NÃO EXISTE OWNER NAS CARTEIRAS OU EM UMA")
        process.exit(0);
    }

    console.log(`O flip atual é: ${flip}`);

    console.log(`Dono da Token amoy: ${ownerTokenamoy}`);
    console.log(`Dono da Token Arbitrum: ${ownerTokenArbitrum}`);
    
    const HTLC = await ethers.getContractFactory('HTLC');
    let amoyDeployed, arbitrumDeployed;

    if (flip == 0) {
        htlcamoy = await HTLC.connect(amoyWallet).deploy(arbitrumWallet.address, tokenamoy.getAddress(), 0); 
        amoyDeployed = await htlcamoy.deploymentTransaction().wait(); 
        htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(amoyWallet.address, tokenArbitrum.getAddress(), 1); 
        arbitrumDeployed = await htlcArbitrum.deploymentTransaction().wait();
    } else if (flip == 1) {
        htlcamoy = await HTLC.connect(arbitrumWallet).deploy(amoyWallet.address, tokenamoy.getAddress(), 0); 
        amoyDeployed = await htlcamoy.deploymentTransaction().wait();
        htlcArbitrum = await HTLC.connect(amoyWallet).deploy(arbitrumWallet.address, tokenArbitrum.getAddress(), 1); 
        arbitrumDeployed = await htlcArbitrum.deploymentTransaction().wait();
    }

    console.log('HTLC deployed on Amoy at:', await htlcamoy.getAddress());
    console.log('HTLC deployed on Arbitrum at:', await htlcArbitrum.getAddress());

    let amoyGasUsedDeploy = amoyDeployed.gasUsed;
    let arbitrumGasUsedDeploy = arbitrumDeployed.gasUsed;

    console.log(`amoy Gas Fee: ${ethers.formatUnits(amoyGasUsedDeploy, 'gwei')} gwei`);
    console.log(`Arbitrum Gas Fee: ${ethers.formatUnits(arbitrumGasUsedDeploy, 'gwei')} gwei`);

    saveGasCosts('amoy Gas Fee (Deploy)', amoyGasUsedDeploy);
    saveGasCosts('Arbitrum Gas Fee (Deploy)', arbitrumGasUsedDeploy);

    await new Promise(resolve => setTimeout(resolve, 5000));

    let amoyApprovalTransaction, arbitrumApprovalTransaction, amoyApprovalReceipt, arbitrumApprovalReceipt;

    if (flip == 0) {
        amoyApprovalTransaction = await tokenamoy.connect(amoyWallet).setApprovalForAll(await htlcamoy.getAddress(), true);
        amoyApprovalReceipt = await amoyApprovalTransaction.wait();
        arbitrumApprovalTransaction = await tokenArbitrum.connect(arbitrumWallet).setApprovalForAll(await htlcArbitrum.getAddress(), true);
        arbitrumApprovalReceipt = await arbitrumApprovalTransaction.wait();
    } else if (flip == 1) {
        amoyApprovalTransaction = await tokenamoy.connect(arbitrumWallet).setApprovalForAll(await htlcamoy.getAddress(), true);
        amoyApprovalReceipt = await amoyApprovalTransaction.wait(); 
        arbitrumApprovalTransaction = await tokenArbitrum.connect(amoyWallet).setApprovalForAll(await htlcArbitrum.getAddress(), true);
        arbitrumApprovalReceipt = await arbitrumApprovalTransaction.wait();
    }

    if (flip == 0){
        await checkNFTBalance(tokenamoy, amoyWallet);
        await checkNFTBalance(tokenArbitrum, arbitrumWallet);
        }
        else if(flip == 1){
        await checkNFTBalance(tokenArbitrum, amoyWallet);
        await checkNFTBalance(tokenamoy, arbitrumWallet);
        }

    const amoyGasUsedApprovalForAll = amoyApprovalReceipt.gasUsed;
    const arbitrumGasUsedApprovalForAll = arbitrumApprovalReceipt.gasUsed;

    console.log(`Amoy Gas Fee ApprovalTransaction: ${ethers.formatUnits(amoyGasUsedApprovalForAll, 'gwei')} gwei`);
    console.log(`Arbitrum Gas Fee ApprovalTransaction: ${ethers.formatUnits(arbitrumGasUsedApprovalForAll, 'gwei')} gwei`);

    saveGasCosts('Amoy Gas Fee (Approval)', amoyGasUsedApprovalForAll);
    saveGasCosts('Arbitrum Gas Fee (Approval)', arbitrumGasUsedApprovalForAll);

    await new Promise(resolve => setTimeout(resolve, 5000));

    let amoyFundTransaction, arbitrumFundTransaction, amoyFundReceipt, arbitrumFundReceipt;

    if (flip == 0) {
        amoyFundTransaction = await htlcamoy.connect(amoyWallet).fund();
        amoyFundReceipt = await amoyFundTransaction.wait();
        arbitrumFundTransaction = await htlcArbitrum.connect(arbitrumWallet).fund();
        arbitrumFundReceipt = await arbitrumFundTransaction.wait();
    } else if (flip == 1) {
        amoyFundTransaction = await htlcamoy.connect(arbitrumWallet).fund();
        amoyFundReceipt = await amoyFundTransaction.wait();
        arbitrumFundTransaction = await htlcArbitrum.connect(amoyWallet).fund();
        arbitrumFundReceipt = await arbitrumFundTransaction.wait();
    }

    console.log('NFTs funded to HTLC contracts.');

    const amoyGasUsedFund = amoyFundReceipt.gasUsed;
    const arbitrumGasUsedFund = arbitrumFundReceipt.gasUsed;

    console.log(`Amoy Gas Fee FundTransaction: ${ethers.formatUnits(amoyGasUsedFund, 'gwei')} gwei`);
    console.log(`Arbitrum Gas Fee FundTransaction: ${ethers.formatUnits(arbitrumGasUsedFund, 'gwei')} gwei`);

    saveGasCosts('Amoy Gas Fee (Fund)', amoyGasUsedFund);
    saveGasCosts('Arbitrum Gas Fee (Fund)', arbitrumGasUsedFund);

    if (flip == 0){
        await checkNFTBalance(tokenamoy, amoyWallet);
        await checkNFTBalance(tokenArbitrum, arbitrumWallet);
        }
        else if(flip == 1){
        await checkNFTBalance(tokenArbitrum, amoyWallet);
        await checkNFTBalance(tokenamoy, arbitrumWallet);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    const secret = 'abracadabra';

    if (flip == 0){
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, amoyProvider);
        await handleHTLCInteraction(htlcamoy, arbitrumWallet, secret, tokenamoy, amoyProvider);

        await new Promise(resolve => setTimeout(resolve, 5000));

        amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
        await handleHTLCInteraction(htlcArbitrum, amoyWallet, secret, tokenArbitrum, arbitrumProvider);
    }
    else if(flip == 1){
        amoyWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, amoyProvider);
        await handleHTLCInteraction(htlcamoy, amoyWallet, secret, tokenamoy, amoyProvider);

        await new Promise(resolve => setTimeout(resolve, 5000));

        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);
        await handleHTLCInteraction(htlcArbitrum, arbitrumWallet, secret, tokenArbitrum, arbitrumProvider);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
