require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

async function main() {
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;
    let htlcSepolia, htlcArbitrum;

    async function checkNFTBalance(contract, wallet) {
        const balance = await contract.balanceOf(wallet.address);
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
            console.error(`Failed to interact with HTLC contract:`, error);
        }
    }

    // Set up the provider for Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    console.log(`Deploying contract from account: ${sepoliaWallet.address}`);

    // Set up the provider for Arbitrum Sepolia
    const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
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

    // Deploy HTLC contracts
    const HTLC = await ethers.getContractFactory('HTLC');
    htlcSepolia = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenSepolia.getAddress(), tokenIdSepolia);
    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenArbitrum.getAddress(), tokenIdArbitrum);

    console.log('HTLC deployed on Sepolia at:', await htlcSepolia.getAddress());
    console.log('HTLC deployed on Arbitrum at:', await htlcArbitrum.getAddress());

    // Approve HTLC contracts
    await tokenSepolia.connect(sepoliaWallet).setApprovalForAll(htlcSepolia.getAddress(), true);
    await tokenArbitrum.connect(arbitrumWallet).setApprovalForAll(htlcArbitrum.getAddress(), true);

    await checkNFTBalance(tokenSepolia, sepoliaWallet);
    await checkNFTBalance(tokenArbitrum, arbitrumWallet);

    // Fund HTLC contracts
    await htlcSepolia.connect(sepoliaWallet).fund();
    await htlcArbitrum.connect(arbitrumWallet).fund();

    console.log('NFTs funded to HTLC contracts.');

    await checkNFTBalance(tokenSepolia, sepoliaWallet);
    await checkNFTBalance(tokenArbitrum, arbitrumWallet);

    const secret = 'abracadabra';

    // Handle HTLC on Sepolia
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, sepoliaProvider);
    await handleHTLCInteraction(htlcSepolia, arbitrumWallet, secret, tokenSepolia);

    // Handle HTLC on Arbitrum
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
    await handleHTLCInteraction(htlcArbitrum, sepoliaWallet, secret, tokenArbitrum);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
