const Token = artifacts.require('Token.sol');
const HTLC = artifacts.require('HTLC.sol');

async function deployTokenAndHTLC(deployer, fromAccount, tokenName, tokenSymbol) {
  await deployer.deploy(Token, tokenName, tokenSymbol, { from: fromAccount });
  const token = await Token.deployed();

  console.time(`Tempo de deploy do Token (${tokenName})`);
  await deployer.deploy(HTLC, fromAccount, token.address, 1, { from: fromAccount });
  console.timeEnd(`Tempo de deploy do Token (${tokenName})`);

  const htlc = await HTLC.deployed();
  await token.approve(htlc.address, 1, { from: fromAccount });

  try {
    console.time(`Tempo de execução do fund (${tokenName})`);
    await htlc.fund({ from: fromAccount });
    console.timeEnd(`Tempo de execução do fund (${tokenName})`);
  } catch (error) {
    console.error(`Erro ao executar a transação de fundo (${tokenName}):`, error);
  }
}

module.exports = async function (deployer, network, addresses) {
  console.time('Tempo total de implantação');

  const [bob, alice] = addresses;

  if (network === 'segundoGanache') {
    for (let i = 0; i < 1; i++) {
      await deployTokenAndHTLC(deployer, bob, `Token A ${i}`, `TKNA${i}`);
    }
  }

  if (network === 'ganache') {
    for (let i = 0; i < 1; i++) {
      await deployTokenAndHTLC(deployer, alice, `Token B ${i}`, `TKNB${i}`);
    }
  }

  console.timeEnd('Tempo total de implantação');
};
