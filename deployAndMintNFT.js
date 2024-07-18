require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    // Implantar contrato em Sepolia
    const sepoliaProvider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);
    console.log(`Fazendo o deploy do contrato na conta: ${sepoliaWallet.address}`)

    const TokenSepolia = await ethers.getContractFactory('MyToken', sepoliaWallet);
    const tokenSepolia = await TokenSepolia.deploy(sepoliaWallet.address);
    console.log('Contract deployed on Sepolia at:', await tokenSepolia.getAddress());

    // Implantar contrato em Arbitrum Sepolia
    const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);
    console.log(`Fazendo o deploy do contrato na conta: ${arbitrumWallet.address}`)

    const TokenArbitrum = await ethers.getContractFactory('MyToken', arbitrumWallet);
    const tokenArbitrum = await TokenArbitrum.deploy(arbitrumWallet.address);
    console.log('Contract deployed on Arbitrum Sepolia at:', await tokenArbitrum.getAddress());

    // Mintar NFT em Sepolia
    const tokenUri = 'https://example.com/nft';
    const tokenIdSepolia = 1;
    const txMintSepolia = await tokenSepolia.safeMint(sepoliaWallet.address, tokenIdSepolia, tokenUri);
    await txMintSepolia.wait();
    console.log(`Minted NFT on Sepolia: Contract ${tokenSepolia.address}, Token ID ${tokenIdSepolia}`);

    // Mintar NFT em Arbitrum Sepolia
    const tokenIdArbitrum = 2;
    const txMintArbitrum = await tokenArbitrum.safeMint(arbitrumWallet.address, tokenIdArbitrum, tokenUri);
    await txMintArbitrum.wait();
    console.log(`Minted NFT on Arbitrum Sepolia: Contract ${tokenArbitrum.address}, Token ID ${tokenIdArbitrum}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
