require('dotenv').config();
const { ethers } = require("ethers");

async function main() {
  // Set up the provider for Sepolia
  const sepoliaProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7555`);
  //const sepoliaProvider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
  // Set up the provider for Arbitrum Sepolia
  const arbitrumProvider = new ethers.JsonRpcProvider(`HTTP://127.0.0.1:7545`);
  //const arbitrumProvider = new ethers.JsonRpcProvider(`https://arb-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

  // Set up the wallet using the private keys from the environment
  const depositWallet1 = new ethers.Wallet(process.env.DEPOSIT_PRIVATE_KEY_SEPOLIA);
  const depositWallet2 = new ethers.Wallet(process.env.DEPOSIT_PRIVATE_KEY_ARBITRUM);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1);
  const wallet2 = new ethers.Wallet(process.env.PRIVATE_KEY_2);

  // SEPOLIA

  // Connect the wallet to Sepolia provider
  const depositWalletSepolia = depositWallet1.connect(sepoliaProvider);
  const walletSepolia = wallet.connect(sepoliaProvider);
  const walletSepolia2 = wallet2.connect(sepoliaProvider);

  // Check balance on Sepolia
  let balanceSepolia = await sepoliaProvider.getBalance(walletSepolia.address);
  let balanceSepolia2 = await sepoliaProvider.getBalance(walletSepolia2.address);
  let balanceSepolia3 = await sepoliaProvider.getBalance(depositWalletSepolia.address);

  console.log(`Sepolia wallet1 balance: ${ethers.formatEther(balanceSepolia)} ETH`);
  console.log(`Sepolia wallet2 balance: ${ethers.formatEther(balanceSepolia2)} ETH`);
  console.log(`Sepolia deposit wallet balance: ${ethers.formatEther(balanceSepolia3)} ETH`);

  // ARBITRUM

  // Connect the wallet to Arbitrum provider
  const depositWalletArbitrum = depositWallet2.connect(arbitrumProvider);
  const walletArbitrum = wallet.connect(arbitrumProvider);
  const walletArbitrum2 = wallet2.connect(arbitrumProvider);

  // Check balance on Arbitrum
  let balanceArbitrum = await arbitrumProvider.getBalance(walletArbitrum.address);
  let balanceArbitrum2 = await arbitrumProvider.getBalance(walletArbitrum2.address);
  let balanceArbitrum3 = await arbitrumProvider.getBalance(depositWalletArbitrum.address);

  console.log(`Arbitrum wallet1 balance: ${ethers.formatEther(balanceArbitrum)} ETH`);
  console.log(`Arbitrum wallet2 balance: ${ethers.formatEther(balanceArbitrum2)} ETH`);
  console.log(`Arbitrum deposit wallet balance: ${ethers.formatEther(balanceArbitrum3)} ETH`);

  /// DESCOMENTE PARA COLOCAR ETH NAS CARTEIRAS VIA GANACHE
/* 
  const value = ethers.parseEther("40");

  // Função para enviar ETH
  async function sendEther(wallet, to, value) {
    try {
      const tx = {
        to: to.address,
        value: value,
        gasLimit: 21000,  // Ajuste conforme necessário
      };

      const txResponse = await wallet.sendTransaction(tx);
      await txResponse.wait();

      console.log(`Transação bem-sucedida: ${txResponse.hash}`);
    } catch (error) {
      console.error(`Erro ao enviar ETH: ${error}`);
    }
  }

  // Transferir 10 ETH para cada carteira na rede Sepolia
  console.log(`Transferindo 10 ETH para cada carteira na rede Sepolia...`);
  await sendEther(depositWalletSepolia, walletSepolia, value);
  await sendEther(depositWalletSepolia, walletSepolia2, value);

  // Transferir 10 ETH para cada carteira na rede Arbitrum Sepolia
  console.log(`Transferindo 10 ETH para cada carteira na rede Arbitrum Sepolia...`);
  await sendEther(depositWalletArbitrum, walletArbitrum, value);
  await sendEther(depositWalletArbitrum, walletArbitrum2, value);

  // Verificar os saldos após a transferência
  balanceSepolia = await sepoliaProvider.getBalance(walletSepolia.address);
  balanceSepolia2 = await sepoliaProvider.getBalance(walletSepolia2.address);

  console.log(`Sepolia wallet1 balance after transfer: ${ethers.formatEther(balanceSepolia)} ETH`);
  console.log(`Sepolia wallet2 balance after transfer: ${ethers.formatEther(balanceSepolia2)} ETH`);

  balanceArbitrum = await arbitrumProvider.getBalance(walletArbitrum.address);
  balanceArbitrum2 = await arbitrumProvider.getBalance(walletArbitrum2.address);

  console.log(`Arbitrum wallet1 balance after transfer: ${ethers.formatEther(balanceArbitrum)} ETH`);
  console.log(`Arbitrum wallet2 balance after transfer: ${ethers.formatEther(balanceArbitrum2)} ETH`); */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

