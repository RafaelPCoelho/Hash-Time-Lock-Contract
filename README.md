# Hash Time Lock Contract
 Exemplo feito de Hash Time Lock Contract criado pelo Youtuber EatTheBlocks;
 O tutorial completo e não modificado se encontra **[Aqui](https://www.youtube.com/watch?v=VZX2ApRLuwM&t)**.
## Sobre o Projeto

Esse projeto tem como objetivo realizar a interoperação de Tokens fungivéis ERC20 entre as redes teste Sepolia e Mumbai com base na implementação do mecanismo Hash Time Lock.

## Conceitos:
### Interoperabilidade
A interoperabilidade é a capacidade de sistemas distintos de se comunicarem e interagirem entre si. A interoperabilidade é um conceito fundamental para a integração de sistemas, pois permite que diferentes sistemas possam trocar informações e compartilhar recursos.

### Tokens Fungíveis (ERC20)
Os tokens fungíveis são tokens que podem ser trocados entre si de forma equivalente, ou seja, um token fungível é igual a outro token fungível. Os tokens fungíveis são representados por contratos inteligentes que seguem o padrão ERC20, que define uma interface padrão para a criação de tokens na blockchain Ethereum. Os tokens fungíveis são amplamente utilizados em aplicações financeiras, como pagamentos, empréstimos e investimentos.

### Mecanismo Hash Time Lock
O mecanismo hash time lock (htlc) funciona exigindo que um pagamento seja validado com um hash criptográfico dentro de um tempo específico, garantindo que a transação ocorra apenas se ambas as partes cumprirem suas obrigações em um período determinado.

## Funcionamento
Para o funcionamento, por meio off-chain, ambas as partes da troca conversam entre si para obter o endereço da carteira destino e origem, uma das partes cria uma palavra chave para desbloquear a troca quando já estiver montada. Em cada uma das redes que será usado o mecanismo, é implementado um contrato com o edendereço da carteira destino, a quantidade de token e a palavra chave com a proteção do hash. Os dois contratos vão bloquear os ativos de ambas as redes por um tempo limitado estipulado no contrato, caso ultrapasse o tempo definido, temos a devolução dos tokens para suas carteiras de origem. A transação só é completa quando ambas as partes colocam a palavra secreta no contrato, fazendo os tokens se direcionar para a carteira de origem

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

## Exemplos de contratos no scan:

**[Eth-Sepolia](https://sepolia.etherscan.io/address/0x285973822fc552d717051ae85c11b94ecf99e9f1)**
**[Polygon-Mumbai](https://mumbai.polygonscan.com/address/0x3b9984f6efc6f92cd4181558342fb2987ce987a4)**

Rafael Coelho
