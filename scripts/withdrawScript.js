const Web3 = require('web3');
const { abi: htlcAbi } = require('./build/contracts/HTLC.json'); // Certifique-se de ajustar o caminho correto
const { abi: tokenAbi } = require('./build/contracts/Token.json'); // Certifique-se de ajustar o caminho correto

const web3Network1 = new Web3('HTTP://127.0.0.1:7545'); // Substitua pela URL da sua primeira rede
const web3Network2 = new Web3('HTTP://127.0.0.1:7555'); // Substitua pela URL da sua segunda rede

const addresses = await web3Network1.eth.getAccounts();

const htlc = new web3Network1.eth.Contract(htlcAbi, '0x41622A520dB3313144C0CA0Ed2d5F8E760646E64'); // Substitua pelo endereço do contrato HTLC na rede 1
const token = new web3Network1.eth.Contract(tokenAbi, '0xD367F43027842DAAA0cC77b21b9D7Fe00F5b7e3A'); // Substitua pelo endereço do contrato Token na rede 1

const gasPrice = '1000000000'; // Substitua pelo preço do gás desejado

async function executeHTLCWithdraw(secret, fromAddress) {
  const options = {
    from: fromAddress,
    gasPrice,
  };

  await htlc.methods.withdraw(secret).send(options);
}

async function checkBalance() {
  const balance = await token.methods.balanceOf(addresses[0]).call();
  console.log(`Balance: ${balance}`);
}

// Executa operações na rede 1
await executeHTLCWithdraw('abracadabra', addresses[0]);
await checkBalance();

// Agora mude para a segunda rede
htlc.options.address = '0x5179A2F8E69Bb6F6334018cbEBa0045D8BAF9D3a'; // Substitua pelo endereço do contrato HTLC na rede 2
token.options.address = '0x0aF16920883936bf7433A49c24196D55c91d458B'; // Substitua pelo endereço do contrato Token na rede 2

// Executa operações na rede 2
await executeHTLCWithdraw('abracadabra', addresses[1]);
await checkBalance();
