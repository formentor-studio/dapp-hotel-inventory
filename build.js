const solc = require('solc')
const fs = require('fs')
const path = require('path')

const CONTRACTS_PATH = path.resolve(__dirname, 'src')
const BUILD_PATH = path.resolve(__dirname, 'dist')


function isSolidity(filename) {
  return filename.endsWith('.sol')
}

function isOpenzeppelin(import_path) {
  return import_path.startsWith("@openzeppelin")
}

function removeSync(path) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true})
  }
}

function ensureDirSync(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, {recursive : true})
  }
}

function findImports(import_path) {
  let sourcePath
  if (isOpenzeppelin(import_path)) {
      sourcePath = path.resolve(__dirname, 'node_modules', import_path);
  } else {
      sourcePath = path.resolve(contractsPath, import_path);
  }
  
  const source = fs.readFileSync(sourcePath, 'utf-8');

  return {contents: source};
}

function compile(contractsPath) {
  console.log(`Compiling contracts...`)

  const sources = {}
  fs.readdirSync(contractsPath).forEach(file => {
    if (isSolidity(file)) {
      const sourcePath = path.resolve(contractsPath, file);
      const source = fs.readFileSync(sourcePath, 'utf-8');
      sources[file] = {'content': source}
    }
  });
  const input = {
      language: 'Solidity',
      sources: sources,
      settings: {
          optimizer: {
              enabled: true,
          },
          outputSelection: {
              '*': {
                  '*': [ '*' ]
              }
          }
      }
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))
  if (output.errors) {
      console.error(output.errors)
  }

  const contracts = []
  for (const sourceName in sources) {
    for (const contractName in output.contracts[sourceName]) {
      contracts.push({
        contractName: contractName,
        abi: output.contracts[sourceName][contractName].abi,
        bytecode: output.contracts[sourceName][contractName].evm.bytecode.object,
        deployedBytecode: output.contracts[sourceName][contractName].evm.deployedBytecode.object
      })
    }
  }

  return contracts
}

function saveContracts(contracts, buildPath) {
  contracts.forEach(({contractName, abi, bytecode, deployedBytecode}) => {
    const contractBinary = {
      abi,
      bytecode,
      deployedBytecode
    }
    const pathname = path.resolve(buildPath, contractName + ".json")

    fs.writeFileSync(pathname, JSON.stringify(contractBinary), 'utf-8')
  })
}

function main(contractsPath, buildPath) {
    // 1. Recreate build folder
    removeSync(buildPath);
    ensureDirSync(buildPath);

    // 2. Compile contracts
    const contracts = compile(contractsPath)

    // 3. Save compilation
    saveContracts(contracts, buildPath)
}

main(CONTRACTS_PATH, BUILD_PATH)