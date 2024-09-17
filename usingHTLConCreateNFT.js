require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;
    let htlcSepolia, htlcArbitrum;

    const secret = 'abracadabra';

    async function checkNFTBalance(contract, wallet) {
        try {
            const balance = await contract.balanceOf(wallet.address);
            console.log(`Wallet ${wallet.address} has ${balance.toString()} NFTs in contract ${await contract.getAddress()}`);
            return balance;
        } catch (error) {
            console.error(`Error checking NFT balance for wallet ${wallet.address} in contract ${await contract.getAddress()}:`, error);
            throw error;  // Re-throw to handle it at a higher level if necessary
        }
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

            await checkNFTBalance(tokenContract, wallet);
        } catch (error) {
            console.error(`Failed to interact with HTLC contract:`, error);
        }
    }

    // Set up the provider for Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);

    // Set up the provider for Arbitrum Sepolia
    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    // Contract Factory
    const Token = await ethers.getContractFactory('TesteHTLC');

    // Load the deployed contracts using their addresses
    const tokenSepoliaAddress = '0x0752E256bD2cA0ce6D883402783d443a64198dd9';
    const tokenArbitrumAddress = '0x8f6e2E92d4a2193D936a00a9b4B3BDF19d7a8857';

    tokenSepolia = Token.attach(tokenSepoliaAddress);
    tokenArbitrum = Token.attach(tokenArbitrumAddress);

    while (true) {
        // Deploy HTLC contracts
        const HTLC = await ethers.getContractFactory('HTLC');
        htlcSepolia = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenSepolia.getAddress(), 0);
        htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenArbitrum.getAddress(), 1);

        console.log('HTLC deployed on Sepolia at:', await htlcSepolia.getAddress());
        console.log('HTLC deployed on Arbitrum at:', await htlcArbitrum.getAddress());

        // Approve HTLC contracts
        await tokenSepolia.connect(sepoliaWallet).setApprovalForAll(htlcSepolia.getAddress(), true);
        await tokenArbitrum.connect(arbitrumWallet).setApprovalForAll(htlcArbitrum.getAddress(), true);

        // Fund HTLC contracts
        await htlcSepolia.connect(sepoliaWallet).fund();
        await htlcArbitrum.connect(arbitrumWallet).fund();

        console.log('NFTs funded to HTLC contracts.');

        // Handle HTLC on Sepolia
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, sepoliaProvider);
        await handleHTLCInteraction(htlcSepolia, arbitrumWallet, secret, tokenSepolia);

        // Handle HTLC on Arbitrum
        sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
        await handleHTLCInteraction(htlcArbitrum, sepoliaWallet, secret, tokenArbitrum);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
