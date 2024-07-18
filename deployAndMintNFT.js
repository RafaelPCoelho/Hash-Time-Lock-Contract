require('dotenv').config();
const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log('Deploying contracts with the account:', deployer.address);

    // Implantar contrato em Sepolia
    const sepoliaProvider = new ethers.AlchemyProvider("sepolia",process.env.ALCHEMY_API_KEY);
    const sepoliaWallet = new ethers.Wallet(process.env.PRIVATE_KEY_1, sepoliaProvider);

    const TokenSepolia = await ethers.getContractFactory('MyToken', sepoliaWallet);
    const tokenSepolia = await TokenSepolia.deploy(sepoliaWallet.address);
    await tokenSepolia.deployed();
    console.log('Contract deployed on Sepolia at:', tokenSepolia.address);

    // Implantar contrato em Arbitrum Sepolia
    const arbitrumProvider = new ethers.providers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
    const arbitrumWallet = new ethers.Wallet(process.env.PRIVATE_KEY_2, arbitrumProvider);

    const TokenArbitrum = await ethers.getContractFactory('MyToken', arbitrumWallet);
    const tokenArbitrum = await TokenArbitrum.deploy(arbitrumWallet.address);
    await tokenArbitrum.deployed();
    console.log('Contract deployed on Arbitrum Sepolia at:', tokenArbitrum.address);

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
