import assert from 'assert'
import solc from 'solc'
import NewContract from '../src/index.js'
import { promisify } from 'bluebird'
import Web3 from 'web3'
import { provider } from 'ethereumjs-testrpc'

const testprovider = provider()
const web3 = new Web3(testprovider)
const getAccounts = promisify(web3.eth.getAccounts.bind(web3.eth))
const newContract = NewContract(testprovider)

describe('eth-new-contract', () => {
  it('should create a new contract from a web3 contract constructor', () => {

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
})
