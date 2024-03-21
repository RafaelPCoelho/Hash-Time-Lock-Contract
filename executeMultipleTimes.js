const { execSync } = require('child_process');

const scriptPath = 'scripts/withdrawScript.js'; // Substitua pelo caminho real do seu script

// Defina o número de vezes que deseja executar o script
const numberOfExecutions = 10;

for (let i = 0; i < numberOfExecutions; i++) {
  console.log(`Executando vez ${i + 1}`);
  
  // Execute o script usando o comando execSync
  try {
    execSync(`truffle exec ${scriptPath} --network segundoGanache`);
    // ou execSync(`truffle exec ${scriptPath} --network ganache`);
    
    console.log(`Execução ${i + 1} concluída.`);
  } catch (error) {
    console.error(`Erro na execução ${i + 1}:`, error.stderr.toString());
    process.exit(1); // Encerre o processo se houver um erro
  }
}

console.log('Execuções concluídas.');
