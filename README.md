# eth-new-contract
[![npm version](https://img.shields.io/npm/v/eth-new-contract.svg)](https://npmjs.org/package/eth-new-contract)

Promisified web3 new contract instantiation with single resolve.

The default `new` method of web3 has the somewhat quirky behavior of invoking the callback twice—once to return the transaction hash and once when the contract is deployed. Usually you want to just wait until the contract is deployed. This simple (12 LOC) module wraps the `new` method in an intuitive promise the resolves to the contract instance when it has been deployed.

## Install

```sh
$ npm install --save eth-new-contract
```

## Usage

```js
const solc = require('solc')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const newContract = require('eth-new-contract')

// compile contract
const compilation = solc.compile(contractSource)
const bytecode = compilation.contracts[contractName].bytecode
const abi = JSON.parse(compilation.contracts[contractName].interface)
const MyContract = web3.eth.contract(abi)

// deploy
newContract(MyContract, { from: web3.eth.accounts[0], data: bytecode, gas: 3e6 })
  .then(contract => {
    console.log('Contract deployed at ' + contract.address)
  })
  .catch(console.log)
```

## License

ISC © [Raine Revere](https://github.com/raineorshine)
