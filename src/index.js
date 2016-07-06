import Web3 from 'web3'
import solc from 'solc'
import merge from 'lodash.merge'
import memoize from 'memoizee'

/** Compiles a Solidity contract from source returning a contract constructor and its bytecode. Memoized on source. */
const compile = (source, provider, cb) => {
  const contractName = source.match(/contract\s([^\s]*)\s*{/)[1]
  if(!contractName) {
    throw new Error('Could not parse contract name from source.')
  }
  const web3 = new Web3(provider)
  const compilation = solc.compile(source)
  const abi = JSON.parse(compilation.contracts[contractName].interface)

  // invoke callback so we can test memoization
  if(cb) {
    cb(source, compilation)
  }

  return {
    Contract: web3.eth.contract(abi),
    bytecode: compilation.contracts[contractName].bytecode
  }
}

export default (provider, options = {}) => {

  // memoize the compile function
  const compileMemoized = memoize(compile, { length: 1 })

  return (sourceOrConstructor, constructorArgs) => {

    return new Promise((resolve, reject) => {
      if(!sourceOrConstructor) {
        throw new Error('No contract source code or constructor provided.')
      }

      let Contract
      let args

      // compile from source
      if(typeof sourceOrConstructor === 'string') {
        const compiled = compileMemoized(sourceOrConstructor, provider, options.onCompile)
        Contract = compiled.Contract
        args = merge({ data: compiled.bytecode }, constructorArgs)
      }
      // use provided constructor
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
}
