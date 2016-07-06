import Web3 from 'web3'
import solc from 'solc'
import merge from 'lodash.merge'

export default provider => (sourceOrConstructor, constructorArgs) => {

  const web3 = new Web3(provider)

  return new Promise((resolve, reject) => {
    if(!sourceOrConstructor) {
      throw new Error('No contract source code or constructor provided.')
    }

    let Contract
    let args

    // source code
    if(typeof sourceOrConstructor === 'string') {
      const source = sourceOrConstructor
      const contractName = source.match(/contract\s([^\s]*)\s*{/)[1]
      if(!contractName) {
        throw new Error('Could not parse contract name from source.')
      }
      const compilation = solc.compile(source)
      const bytecode = compilation.contracts[contractName].bytecode
      const abi = JSON.parse(compilation.contracts[contractName].interface)

      Contract = web3.eth.contract(abi)
      args = merge({ data: bytecode }, constructorArgs)
    }
    // constructor
    else {
      Contract = sourceOrConstructor
      args = constructorArgs
    }

    // return a promise of a new contract instance
    Contract.new(args, (err, contract) => {
      if (err) {
        reject(err)
      } else if (contract.address) {
        resolve(contract)
      }
    })
  })
}
