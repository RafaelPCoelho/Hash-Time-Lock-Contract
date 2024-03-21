const Web3 = require('web3');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const TruffleContract = require('@truffle/contract');
const mnemonic = ['0xd691bcf1f080d2f602503119e6c1c6d16ab9fe412e71777098268f9b95889b5a','0xa1e85e8f4e926a8a3ab643339389cd0b94be4d39c7012b1f0c93e63f2f16d908'];

// Importa os artefatos dos contratos
const HTLCJSON = require('../build/contracts/HTLC.json');
const TokenJSON = require('../build/contracts/Token.json');

// Conecta aos provedores de blockchain
const chocolateProvider = new HDWalletProvider(mnemonic, "HTTP://127.0.0.1:7545");
const morangoProvider = new HDWalletProvider(mnemonic, "HTTP://127.0.0.1:7555");

const chocolateWeb3 = new Web3(chocolateProvider);
const morangoWeb3 = new Web3(morangoProvider);

// Inicializa os contratos
const ChocolateHTLC = TruffleContract(HTLCJSON);
const ChocolateToken = TruffleContract(TokenJSON);
ChocolateHTLC.setProvider(chocolateWeb3.currentProvider);
ChocolateToken.setProvider(chocolateWeb3.currentProvider);

const MorangoHTLC = TruffleContract(HTLCJSON);
const MorangoToken = TruffleContract(TokenJSON);
MorangoHTLC.setProvider(morangoWeb3.currentProvider);
MorangoToken.setProvider(morangoWeb3.currentProvider);

async function main() {
    // Obtém as contas
    const chocolateAddresses = await chocolateWeb3.eth.getAccounts();
    const morangoAddresses = await morangoWeb3.eth.getAccounts();

    // Imprime os endereços
    console.log("Endereços na rede Chocolate: ", chocolateAddresses);
    console.log("Endereços na rede Morango: ", morangoAddresses);
  
    try {
        // Interage com o contrato HTLC na rede Chocolate
        const chocolateHtlc = await ChocolateHTLC.deployed();
        await console.log(`Chocolate HTLC contract address: ${chocolateHtlc.address}`);

        // Estima o custo de gas da função withdraw na rede Chocolate
        const chocolateWithdrawGasEstimate = await chocolateHtlc.withdraw.estimateGas('abracadabra', {from: chocolateAddresses[0]});
        console.log(`Estimativa de Gas para retirada na rede Chocolate: ${chocolateWithdrawGasEstimate}`);

        await chocolateHtlc.withdraw('abracadabra', {from: chocolateAddresses[0]});

        // Interage com o contrato Token na rede Chocolate
        const chocolateToken = await ChocolateToken.deployed();
        const chocolateBalance = await chocolateToken.balanceOf(chocolateAddresses[0]);
        await console.log(`Chocolate Balance: ${chocolateBalance.toString()}`);

        // Interage com o contrato HTLC na rede Morango
        const morangoHtlc = await MorangoHTLC.deployed();
        await console.log(`Morango HTLC contract address: ${morangoHtlc.address}`);

        // Estima o custo de gas da função withdraw na rede Morango
        const morangoWithdrawGasEstimate = await morangoHtlc.withdraw.estimateGas('abracadabra', {from: morangoAddresses[1]});
        console.log(`Estimativa de Gas para retirada na rede Morango: ${morangoWithdrawGasEstimate}`);

        await morangoHtlc.withdraw('abracadabra', {from: morangoAddresses[1]});

        // Interage com o contrato Token na rede Morango
        const morangoToken = await MorangoToken.deployed();
        const morangoBalance = await morangoToken.balanceOf(morangoAddresses[1]);
        await console.log(`Morango Balance: ${morangoBalance.toString()}`);
    } catch (error) {
        console.error('Erro ao retirar: ', error);
    }
    process.exit();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
