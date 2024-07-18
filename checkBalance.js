require('dotenv').config();
const { ethers } = require("ethers");

async function main() {
  // Set up the provider for Sepolia
  const sepoliaProvider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  // Set up the provider for Arbitrum Sepolia
  const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

  // Set up the wallet using the first private key from the environment
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1);
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2);

  // Connect the wallet to Sepolia provider
  const walletSepolia = wallet.connect(sepoliaProvider);
  const walletSepolia2 = wallet2.connect(sepoliaProvider);
  // Check balance on Sepoliaethers.provider.getBalance(walletSepolia);
  
  const balanceSepolia = await sepoliaProvider.provider.getBalance(walletSepolia);
  const balanceSepolia2 = await sepoliaProvider.provider.getBalance(walletSepolia2);
  console.log(`Só verificando uma coisa: ${walletSepolia.address}`)
  console.log(`Sepolia wallet1 balance: ${ethers.formatEther(balanceSepolia)} ETH`);
  console.log(`Sepolia wallet2 balance: ${ethers.formatEther(balanceSepolia2)} ETH`);

  // Connect the wallet to Arbitrum Sepolia provider
  const walletArbitrum = wallet.connect(arbitrumProvider);
  const walletArbitrum2 = wallet2.connect(arbitrumProvider);
  // Check balance on Arbitrum Sepolia
  const balanceArbitrum = await arbitrumProvider.provider.getBalance(walletArbitrum);
  const balanceArbitrum2 = await arbitrumProvider.provider.getBalance(walletArbitrum2);
  console.log(`Arbitrum Sepolia wallet1 balance: ${ethers.formatEther(balanceArbitrum)} ETH`);
  console.log(`Arbitrum Sepolia wallet2 balance: ${ethers.formatEther(balanceArbitrum2)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
