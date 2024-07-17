require('dotenv').config();
const { ethers } = require("ethers");

async function main() {
  // Set up the provider for Sepolia
  const sepoliaProvider = new ethers.providers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  // Set up the provider for Arbitrum Sepolia
  const arbitrumProvider = new ethers.providers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

  // Set up the wallet using the first private key from the environment
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1);
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2);

  // Connect the wallet to Sepolia provider
  const walletSepolia = wallet.connect(sepoliaProvider);
  const walletSepolia2 = wallet2.connect(sepoliaProvider);
  // Check balance on Sepolia
  const balanceSepolia = await walletSepolia.getBalance();
  const balanceSepolia2 = await walletSepolia2.getBalance();
  console.log(`Sepolia wallet1 balance: ${ethers.utils.formatEther(balanceSepolia)} ETH`);
  console.log(`Sepolia wallet2 balance: ${ethers.utils.formatEther(balanceSepolia2)} ETH`);

  // Connect the wallet to Arbitrum Sepolia provider
  const walletArbitrum = wallet.connect(arbitrumProvider);
  const walletArbitrum2 = wallet2.connect(arbitrumProvider);
  // Check balance on Arbitrum Sepolia
  const balanceArbitrum = await walletArbitrum.getBalance();
  const balanceArbitrum2 = await walletArbitrum2.getBalance();
  console.log(`Arbitrum Sepolia wallet1 balance: ${ethers.utils.formatEther(balanceArbitrum)} ETH`);
  console.log(`Arbitrum Sepolia wallet2 balance: ${ethers.utils.formatEther(balanceArbitrum2)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
