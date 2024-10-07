# dapp-hotel-reservation
Example of __smart contract__ to manage hotel inventory and reservations.

The __smart contract__ implements the behaviour defined by the following BDD board:

![](./test/BDD_hotel%20reservations.jpg)

## 📚 Stack
- [solc-js](https://github.com/ethereum/solc-js) to compile smart contracts.
- [cucumber-js](https://github.com/cucumber/cucumber-js) to test smart contracts.
- [Hardhat](https://github.com/NomicFoundation/hardhat) to run ethereum node during execution of tests.
- [ethers](https://github.com/ethers-io/ethers.js) to interact with smart contracts during tests.

## 🗺️ Structure
`./src/` with the source of smart contracts.  
`./test/features` with the tests.  
`./dist/` with the compilation of the smart contract - __abi__ and __bytecode__ -.
## 🚀 Usage

1. Install dependencies
```bash
yarn install
```

2. Build smart contract
```bash
yarn build
```

3. Test smart contract
```bash
yarn test
```
