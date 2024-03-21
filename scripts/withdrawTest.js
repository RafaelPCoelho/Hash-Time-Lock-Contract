const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const TruffleContract = require('@truffle/contract');
const mnemonic = ['bcf904484a542d8b97a078cfbcee2799e1a1bc2fb435351707ec7f5e2a92cdad','8fd66c5afa2f7796766111fa72adae1b4b01e5044f5587e868ccf77611d0a5fc'];

// Importa os artefatos dos contratos
const HTLCJSON = require('../build/contracts/HTLC.json');
const TokenJSON = require('../build/contracts/Token.json');

// Conecta aos provedores de blockchain
const sepoliaProvider = new HDWalletProvider(mnemonic, "https://eth-sepolia.g.alchemy.com/v2/Yxp98hWF4yjIovcacpMThU6zHrbolj9Y");
const mumbaiProvider = new HDWalletProvider(mnemonic, "https://polygon-mumbai.g.alchemy.com/v2/F6kHODuzePAi8ySmfssr-UR_Pt4aJpSW");

const sepoliaWeb3 = new Web3(sepoliaProvider);
const mumbaiWeb3 = new Web3(mumbaiProvider);


// Inicializa os contratos
const SepoliaHTLC = TruffleContract(HTLCJSON);
const SepoliaToken = TruffleContract(TokenJSON);
SepoliaHTLC.setProvider(sepoliaWeb3.currentProvider);
SepoliaToken.setProvider(sepoliaWeb3.currentProvider);

const MumbaiHTLC = TruffleContract(HTLCJSON);
const MumbaiToken = TruffleContract(TokenJSON);
MumbaiHTLC.setProvider(mumbaiWeb3.currentProvider);
MumbaiToken.setProvider(mumbaiWeb3.currentProvider);

async function main() {
    // Obtém as contas
    const sepoliaAddresses = await sepoliaWeb3.eth.getAccounts();
    const mumbaiAddresses = await mumbaiWeb3.eth.getAccounts();

    // Imprime os endereços
    console.log("Endereços na rede Sepolia: ", sepoliaAddresses);
    console.log("Endereços na rede Mumbai: ", mumbaiAddresses);
  
    try {
        // Interage com o contrato HTLC na rede Sepolia
        const sepoliaHtlc = await SepoliaHTLC.deployed();
        await console.log(`Sepolia HTLC contract address: ${sepoliaHtlc.address}`);

        // Estima o custo de gas da função withdraw na rede Sepolia
        const sepoliaWithdrawGasEstimate = await sepoliaHtlc.withdraw.estimateGas('abracadabra', {from: sepoliaAddresses[0]});
        console.log(`Estimativa de Gas para retirada na rede Sepolia: ${sepoliaWithdrawGasEstimate}`);

        await sepoliaHtlc.withdraw('abracadabra', {from: sepoliaAddresses[0]});

        // Interage com o contrato Token na rede Sepolia
        const sepoliaToken = await SepoliaToken.deployed();
        const sepoliaBalance = await sepoliaToken.balanceOf(sepoliaAddresses[0]);
        await console.log(`Sepolia Balance: ${sepoliaBalance.toString()}`);

        // Interage com o contrato HTLC na rede Mumbai
        const mumbaiHtlc = await MumbaiHTLC.deployed();
        await console.log(`Mumbai HTLC contract address: ${mumbaiHtlc.address}`);

        // Estima o custo de gas da função withdraw na rede Mumbai
        const mumbaiWithdrawGasEstimate = await mumbaiHtlc.withdraw.estimateGas('abracadabra', {from: mumbaiAddresses[1]});
        console.log(`Estimativa de Gas para retirada na rede Mumbai: ${mumbaiWithdrawGasEstimate}`);

        await mumbaiHtlc.withdraw('abracadabra', {from: mumbaiAddresses[1]});

        // Interage com o contrato Token na rede Mumbai
        const mumbaiToken = await MumbaiToken.deployed();
        const mumbaiBalance = await mumbaiToken.balanceOf(mumbaiAddresses[1]);
        await console.log(`Mumbai Balance: ${mumbaiBalance.toString()}`);
    } catch (error) {
        console.error('Erro ao retirar: ', error);
    }
    process.exit();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});

