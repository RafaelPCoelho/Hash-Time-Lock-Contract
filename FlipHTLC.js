require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;
    let htlcSepolia, htlcArbitrum;
    let flip;

    async function checkNFTBalance(contract, wallet) { 

        const balance = await contract.connect(wallet).balanceOf(wallet.address); 
        console.log(`Wallet ${wallet.address} has ${balance.toString()} NFTs in contract ${await contract.getAddress()}`);
        return balance;
    }

    async function handleHTLCInteraction(htlcContract, wallet, secret, tokenContract) {
        try {
            const startTime = await htlcContract.startTime();
            const lockTime = await htlcContract.lockTime();

            if (Date.now() / 1000 > startTime + lockTime) {
                console.log(`Lock time expired. Attempting refund...`);
                const txRefund = await htlcContract.connect(wallet).refund();
                await txRefund.wait();
                console.log(`NFT refunded to the original owner.`);
            } else {
                console.log(`Lock time still valid. Attempting withdrawal...`);
                const txWithdraw = await htlcContract.connect(wallet).withdraw(secret);
                await txWithdraw.wait();
                console.log(`NFT withdrawn successfully.`);
            }

            await checkNFTBalance(tokenContract, wallet); // Verifica o saldo após a interação com o HTLC
        } catch (error) {
            console.error(`Failed to interact with HTLC contract:, ${error}`);
        }
    }

    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);

    // Set up the provider for Sepolia
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    // Set up the provider for Arbitrum Sepolia
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);


    // Load deployed token contracts
    const Token = await ethers.getContractFactory('TesteHTLC');
    tokenSepolia = Token.attach("0x5762F4A951EAAE7CbE2D12A159b6203b4eDC2EEa");  
    tokenArbitrum = Token.attach("0xDB05035B8212FD879e49628D57A1346Db92B887e"); 

    // Verifica os owners
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
        System.exit(0);
    }

    console.log(`O flip atual é: ${flip}`)
    
    console.log(`Dono da Token Sepolia: ${ownerTokenSepolia}`);
    console.log(`Dono da Token Arbitrum: ${ownerTokenArbitrum}`);

    // Deploy HTLC contracts
    const HTLC = await ethers.getContractFactory('HTLC');

    if (flip == 0){
    htlcSepolia = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenSepolia.getAddress(), 0); // Use correct token ID
    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenArbitrum.getAddress(), 1); // Use correct token ID
    }
    else if(flip == 1){
    htlcSepolia = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenSepolia.getAddress(), 0); // Use correct token ID
    htlcArbitrum = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenArbitrum.getAddress(), 1); // Use correct token ID
    }

    console.log('HTLC deployed on Sepolia at:', await htlcSepolia.getAddress());
    console.log('HTLC deployed on Arbitrum at:', await htlcArbitrum.getAddress());

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Approve HTLC contracts
    if (flip == 0){
    await tokenSepolia.connect(sepoliaWallet).setApprovalForAll(htlcSepolia.getAddress(), true);
    await tokenArbitrum.connect(arbitrumWallet).setApprovalForAll(htlcArbitrum.getAddress(), true)
    }
    else if(flip == 1){

    await tokenSepolia.connect(arbitrumWallet).setApprovalForAll(htlcSepolia.getAddress(), true);
    await tokenArbitrum.connect(sepoliaWallet).setApprovalForAll(htlcArbitrum.getAddress(), true)

    }
    if (flip == 0){
    await checkNFTBalance(tokenSepolia, sepoliaWallet);
    await checkNFTBalance(tokenArbitrum, arbitrumWallet);
    }
    else if(flip == 1){


    await checkNFTBalance(tokenArbitrum, sepoliaWallet);
    await checkNFTBalance(tokenSepolia, arbitrumWallet);
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Fund HTLC contracts
    if (flip == 0){
    await htlcSepolia.connect(sepoliaWallet).fund();
    await htlcArbitrum.connect(arbitrumWallet).fund();
    }
    else if(flip == 1){
    await htlcSepolia.connect(arbitrumWallet).fund();
    await htlcArbitrum.connect(sepoliaWallet).fund();
    }

    console.log('NFTs funded to HTLC contracts.');

    await new Promise(resolve => setTimeout(resolve, 5000));
    if (flip == 0){
    await checkNFTBalance(tokenSepolia, sepoliaWallet);
    await checkNFTBalance(tokenArbitrum, arbitrumWallet);
    }
    else if(flip ==1){
    await checkNFTBalance(tokenArbitrum, sepoliaWallet);
    await checkNFTBalance(tokenSepolia, arbitrumWallet);
    }

    const secret = 'abracadabra';

    if (flip == 0){
    // Handle HTLC on Sepolia
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, sepoliaProvider);
    await handleHTLCInteraction(htlcSepolia, arbitrumWallet, secret, tokenSepolia);

    // Handle HTLC on Arbitrum
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
    await handleHTLCInteraction(htlcArbitrum, sepoliaWallet, secret, tokenArbitrum);
    }
    else if(flip ==1){
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    // Handle HTLC on Sepolia
    await handleHTLCInteraction(htlcSepolia, sepoliaWallet, secret, tokenSepolia);

    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);
    // Handle HTLC on Arbitrum
    await handleHTLCInteraction(htlcArbitrum, arbitrumWallet, secret, tokenArbitrum);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });