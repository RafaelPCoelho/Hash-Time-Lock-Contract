# Exemplo-HTLC
 Exemplo feito de Hash Time Lock Contract criado pelo Youtuber EatTheBlocks;
 
 O tutorial completo e não modificado se encontra **[Aqui](https://www.youtube.com/watch?v=VZX2ApRLuwM&t)**.

 ## Pré-requisitos
 
 * Truffle
 * Ganache
 * Visual Studio Code

## Configurando âmbiente

Após dar Clone no repositório, crie duas redes no Ganache abrindo duas janelas para cada uma. Após a criação de redes, vá até o arquivo **truffle-config.js** e modifique as chaves privadas para as suas respectivas redes.

```javascript
const segundoGanacheProvider = new HDWalletProvider({
  privateKeys: [
    '0xd691bcf1f080d2f602503119e6c1c6d16ab9fe412e71777098268f9b95889b5a',/// Troque suas chaves aqui e repita na rede de baixo
    '0xa1e85e8f4e926a8a3ab643339389cd0b94be4d39c7012b1f0c93e63f2f16d908',
    '0x6cf6fef9d0853a16d313b8c918b0bffa1c59c23366b56e22217cfca587ed3d9d',
    '0x2a636ede04cb8a4fd8dd1d41002018489b48893cccddf666277226d537f32aee',
  ],
  providerOrUrl: 'HTTP://127.0.0.1:7555' //Coloque aqui a sua URL da rede
});

const ganacheProvider = new HDWalletProvider({
  privateKeys: [
    '0xd691bcf1f080d2f602503119e6c1c6d16ab9fe412e71777098268f9b95889b5a',
    '0xa1e85e8f4e926a8a3ab643339389cd0b94be4d39c7012b1f0c93e63f2f16d908',
    '0x6cf6fef9d0853a16d313b8c918b0bffa1c59c23366b56e22217cfca587ed3d9d',
    '0x2a636ede04cb8a4fd8dd1d41002018489b48893cccddf666277226d537f32aee',
  ],
  providerOrUrl: 'HTTP://127.0.0.1:7545'
});

networks: {
    segundoGanache: {
      provider: () => segundoGanacheProvider,
      network_id: "5755", /// Coloque aqui o ID da sua rede e repita na de baixo
      gas: 6000000
    },
    ganache: {
      provider: () => ganacheProvider,
      network_id: "5777", 
      gas: 6000000
    },
```
Você irá precisar de pelo menos 2 contas, poís é necessário que as duas tenham ETH das duas redes!

Após colocar colocar as configurações nas redes no código, é preciso colocar ETH nas duas contas que serão usadas no exemplo. Para fazer isso, entre no console das redes via Truffle:
```
truffle console --network ganache   
```
E rode o comando trocando as contas para a da sua máquina.
```
web3.eth.sendTransaction({ from: '0x79DE58d9c44fD03b208897E5D08b3C766854D925', gasPrice: "20000000000", gas: "6500000", to: '0x4D529b493a0E6d11186683edAc98dAe95BCb8E7d', value: "20000000000000000000", data:"" })
```
## Tutorial
Após vérificar se as duas contas estão com ETH das duas redes Blockchain, abra um terminal no diretório principal e execute os comandos:

```
truffle migrate --network segundoGanache --reset
truffle migrate --network ganache --reset   
```
Com esses comandos o truffle irá migrar os contratos de Token e HTLC para as redes Blockchain do Ganache, depois abra dois terminais para a execução dos comandos:

* Primeiro terminal (execute de forma separada e espere copilar)

```
truffle console --network ganache   
const addresses = await web3.eth.getAccounts()
const htlc = await HTLC.deployed()
await htlc.withdraw('abracadabra', {from: addresses[0]})
```
* Segundo terminal
  
```
truffle console --network segundoGanache    
const addresses = await web3.eth.getAccounts()
const htlc = await HTLC.deployed()
await htlc.withdraw('abracadabra', {from: addresses[1]})
```
* Para verificar se funcionou, digite no segundo terminal
```
const token = await Token.deployed()
const balance = await token.balanceOf(addresses[1])
balance.toString()
```
Caso tudo funcione vai ter um Token na balance!

Rafael Coelho
