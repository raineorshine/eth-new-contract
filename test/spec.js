import assert from 'assert'
import solc from 'solc'
import NewContract from '../src/index.js'
import { promisify } from 'bluebird'
import Web3 from 'web3'
import { provider } from 'ethereumjs-testrpc'

const testprovider = provider()
const web3 = new Web3(testprovider)
const getAccounts = promisify(web3.eth.getAccounts.bind(web3.eth))

describe('eth-new-contract', () => {
  it('should create a new contract from a web3 contract constructor', () => {

    const newContract = NewContract(testprovider)
    const compilation = solc.compile('contract MyContract { function GetAnswer() constant returns(uint) { return 42; } }')
    const bytecode = compilation.contracts.MyContract.bytecode
    const abi = JSON.parse(compilation.contracts.MyContract.interface)
    const MyContract = web3.eth.contract(abi)

    return getAccounts()
      .then(accounts => newContract(MyContract, {
        from: accounts[0],
        data: bytecode
      }))
      .then(contract => {
        assert(contract.address, 'Address is not defined')
        return promisify(contract.GetAnswer.bind(contract))().then(val => {
          assert.equal(val.toString(), '42')
        })
      })
  })

  it('should create a new contract from source', () => {

    const newContract = NewContract(testprovider)
    const source = 'contract MyContract { function GetAnswer() constant returns(uint) { return 42; } }'

    return getAccounts()
      .then(accounts => newContract(source, { from: accounts[0] }))
      .then(contract => {
        assert(contract.address, 'Address is not defined')
        return promisify(contract.GetAnswer.bind(contract))().then(val => {
          assert.equal(val.toString(), '42')
        })
      })
  })

  it('should create a library from source', () => {

    const newContract = NewContract(testprovider)
    const source = 'library MyContract { function GetAnswer() constant returns(uint) { return 42; } }'

    return getAccounts()
      .then(accounts => newContract(source, { from: accounts[0] }))
      .then(contract => {
        assert(contract.address, 'Address is not defined')
      })
  })

  it('should use a cached version of a contract with the same source', function () {
    this.timeout(5000)

    let pinger = 0;
    const ping = () => { pinger++ }

    const newContract = NewContract(testprovider, { onCompile: ping })
    const source1 = 'contract MyContract { function GetAnswer() constant returns(uint) { return 42; } }'
    const source2 = 'contract MyContract { function GetAnswer() constant returns(uint) { return 0; } }'

    return getAccounts().then(accounts => {
      return Promise.resolve()
      .then(() => newContract(source1, { from: accounts[0] }))
      .then(() => newContract(source1, { from: accounts[0] }))
      .then(() => newContract(source1, { from: accounts[0] }))
      .then(() => assert.equal(pinger, 1))
      .then(() => newContract(source2, { from: accounts[0] }))
      .then(() => assert.equal(pinger, 2))
    })
  })
})
