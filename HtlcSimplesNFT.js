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

    // Set up the provider for Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
    //const sepoliaProvider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    console.log(`Fazendo o deploy do contrato na conta: ${sepoliaWallet.address}`);

    // Set up the provider for Arbitrum Sepolia
    const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
    //const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);


    // Contract Factory
    const Token = await ethers.getContractFactory('TesteHTLC');

    // Deploy contract on Sepolia
    const TokenSepolia = Token.connect(sepoliaWallet);
    tokenSepolia = await TokenSepolia.deploy(sepoliaWallet.address);
    console.log('Contract deployed on Sepolia at:', await tokenSepolia.getAddress());

    //await new Promise(resolve => setTimeout(resolve, 5000)); // 10 segundos de espera para redes publicas

    // Deploy contract on Arbitrum Sepolia
    const TokenArbitrum = Token.connect(arbitrumWallet);
    tokenArbitrum = await TokenArbitrum.deploy(arbitrumWallet.address);
    console.log('Contract deployed on Arbitrum Sepolia at:', await tokenArbitrum.getAddress());

    // Mint NFT on Sepolia
    const tokenIdSepolia = 0;
    console.log('Attempting to mint NFT on Sepolia');
    try {
        const txMintSepolia = await tokenSepolia.safeMint(sepoliaWallet.address, tokenIdSepolia);
        await txMintSepolia.wait();

        //await new Promise(resolve => setTimeout(resolve, 1000)); // 10 segundos de espera para redes publicas

        console.log(`Minted NFT on Sepolia: Contract ${await tokenSepolia.getAddress()}, Token ID ${tokenIdSepolia} WALLET: ${sepoliaWallet.address}`);

        // Check the owner of the minted NFT
        const owner = await tokenSepolia.ownerOf(tokenIdSepolia);
        expect(owner).to.equal(sepoliaWallet.address);
    } catch (error) {
        console.error('Failed to mint NFT on Sepolia:', error);
    }

    // Mint NFT on Arbitrum Sepolia
    const tokenIdArbitrum = 1;
    console.log('Attempting to mint NFT on Arbitrum Sepolia');
    try {
        const txMintArbitrum = await tokenArbitrum.safeMint(arbitrumWallet.address, tokenIdArbitrum);
        await txMintArbitrum.wait();
        console.log(`Minted NFT on Arbitrum Sepolia: Contract ${await tokenArbitrum.getAddress()}, Token ID ${tokenIdArbitrum} WALLET: ${arbitrumWallet.address}`);

        // Check the owner of the minted NFT
        const owner = await tokenArbitrum.ownerOf(tokenIdArbitrum);
        expect(owner).to.equal(arbitrumWallet.address);
    } catch (error) {
        console.error('Failed to mint NFT on Arbitrum Sepolia:', error);
    }

    // Deploy HTLC contracts
    const HTLC = await ethers.getContractFactory('HTLC');

    // Deploy HTLC on Sepolia
    const HtlcSepolia = HTLC.connect(sepoliaWallet);
    htlcSepolia = await HtlcSepolia.deploy(arbitrumWallet.address, tokenSepolia.getAddress(), tokenIdSepolia);

    console.log('HTLC deployed on Sepolia at:', await htlcSepolia.getAddress());

    // Deploy HTLC on Arbitrum
    htlcArbitrum = await HTLC.connect(arbitrumWallet).deploy(sepoliaWallet.address, tokenArbitrum.getAddress(), tokenIdArbitrum);
    console.log('HTLC deployed on Arbitrum at:', await htlcArbitrum.getAddress());

    await new Promise(resolve => setTimeout(resolve, 5000)); // 10 segundos de espera para redes publicas

    // Approve HTLC contracts to transfer NFTs
    await tokenSepolia.connect(sepoliaWallet).setApprovalForAll(htlcSepolia.getAddress(), true);
    await tokenArbitrum.connect(arbitrumWallet).setApprovalForAll(htlcArbitrum.getAddress(), true);

    await checkNFTBalance(tokenSepolia, sepoliaWallet);
    await checkNFTBalance(tokenArbitrum, arbitrumWallet);

    // Fund HTLC contracts
    await htlcSepolia.connect(sepoliaWallet).fund();
    console.log('NFT funded to HTLC on Sepolia');

    await htlcArbitrum.connect(arbitrumWallet).fund();
    console.log('NFT funded to HTLC on Arbitrum');

    await checkNFTBalance(tokenSepolia, sepoliaWallet);
    await checkNFTBalance(tokenArbitrum, arbitrumWallet);

    // Perform the withdrawal (swap) using the correct secret
    await new Promise(resolve => setTimeout(resolve, 2000)); // 10 segundos de espera para redes publicas
    const secret = 'abracadabra';

    // Withdraw NFT from HTLC on Sepolia
    try {
        console.log('Attempting to withdraw NFT from HTLC on Sepolia');
        arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, sepoliaProvider);
        const txWithdrawSepolia = await htlcSepolia.connect(arbitrumWallet).withdraw(secret);
        await txWithdrawSepolia.wait();
        console.log('NFT withdrawn from HTLC on Sepolia');

        await checkNFTBalance(tokenSepolia, arbitrumWallet);
    } catch (error) {
        console.error('Failed to withdraw NFT from HTLC on Sepolia:', error);
    }

    // Withdraw NFT from HTLC on Arbitrum
    try {
        console.log('Attempting to withdraw NFT from HTLC on Arbitrum');
        sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, arbitrumProvider);
        const txWithdrawArbitrum = await htlcArbitrum.connect(sepoliaWallet).withdraw(secret);
        await txWithdrawArbitrum.wait();
        console.log('NFT withdrawn from HTLC on Arbitrum');

        await checkNFTBalance(tokenArbitrum, sepoliaWallet);
    } catch (error) {
        console.error('Failed to withdraw NFT from HTLC on Arbitrum:', error);
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
