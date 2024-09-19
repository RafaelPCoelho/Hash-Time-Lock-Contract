require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
    let sepoliaWallet, arbitrumWallet;
    let tokenSepolia, tokenArbitrum;
    let htlcSepolia, htlcArbitrum;

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
            console.error(`Failed to interact with HTLC contract:, error`);
        }
    }

    // Set up the provider for Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);

    // Set up the provider for Arbitrum Sepolia
    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    // Load deployed token contracts
    const Token = await ethers.getContractFactory('TesteHTLC');
    tokenSepolia = Token.attach("0x79de58754ADbbaDED4e33FA6f2506B52201778d4");  // Replace with actual address
    tokenArbitrum = Token.attach("0xa9886b53911c9cd6b30De390050136e88BE91b6E"); // Replace with actual address


    // Deploy HTLC contracts
    const HTLC = await ethers.getContractFactory('HTLC');
    htlcSepolia = await HTLC.connect(sepoliaWallet).deploy(arbitrumWallet.address, tokenSepolia.getAddress(), 0); // Use correct token ID
    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenArbitrum.getAddress(), 1); // Use correct token ID

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