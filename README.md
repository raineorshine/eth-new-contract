# eth-new-contract
[![npm version](https://img.shields.io/npm/v/eth-new-contract.svg)](https://npmjs.org/package/eth-new-contract)

eth-new-contract is an npm module that allows you to deploy a Solidity contract and create a web3 contract instance straight from source. Subsequent calls use cached bytecode for performance.

The default `new` method of web3 has the somewhat quirky behavior of invoking its callback twice—once to return the transaction hash and once when the contract is deployed. Usually you don't care about the transaction hash initially, so in this library, the promise resolves when it is deployed. `contract.transactionHash` can then be accessed like on any web3 contract.

## Install

```sh
$ npm install --save eth-new-contract
```

## Usage

```js
const Web3 = require('web3')
const NewContract = require('eth-new-contract')

// you must provide a web3 provider
const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const newContract = NewContract(provider)

// instantiate from source
const source = 'contract MyContract { function GetAnswer() constant returns(uint) { return 42; } }'
newContract(source, { from: web3.eth.accounts[0] })
  .then(contract => {
    console.log('Contract deployed at ' + contract.address)
  })
  .catch(console.log)
```

You can also compile and generate the web3 constructor yourself and pass it to eth-new-contract:

```js
const solc = require('solc')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const newContract = require('eth-new-contract')() // no provider needed

// compile contract
const compilation = solc.compile(contractSource)
const bytecode = compilation.contracts[contractName].bytecode
const abi = JSON.parse(compilation.contracts[contractName].interface)
const MyContract = web3.eth.contract(abi)

// deploy
newContract(MyContract, { from: web3.eth.accounts[0], data: bytecode })
  .then(contract => {
    console.log('Contract deployed at ' + contract.address)
  })
  .catch(console.log)
```

## License

ISC © [Raine Revere](https://github.com/raineorshine)
