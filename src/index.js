import Web3 from 'web3'
import solc from 'solc'
import merge from 'lodash.merge'
import memoize from 'memoizee'

/** Compiles a Solidity contract from source returning a contract constructor and its bytecode. Memoized on source. */
const compile = (source, provider, cb) => {
  const contractNameMatch = source.match(/(?:contract|library)\s([^\s]*)\s*{/)
  if(!contractNameMatch) {
    throw new Error('Could not parse contract name from source.')
  }
  const contractName = contractNameMatch[1]
  const web3 = new Web3(provider)
  const compilation = solc.compile(source)
  const contract = compilation.contracts[':' + contractName]
  const abi = JSON.parse(contract.interface)

  // invoke callback so we can test memoization
  if(cb) {
    cb(source, compilation)
  }

  return {
    Contract: web3.eth.contract(abi),
    bytecode: contract.bytecode
  }
}

export default (provider, options = {}) => {

  // memoize the compile function
  const compileMemoized = memoize(compile, { length: 1 })

  return (sourceOrConstructor, ...constructorArgs) => {

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
        args = [].concat(constructorArgs.slice(0, constructorArgs.length - 1), merge({ data: compiled.bytecode }, constructorArgs[constructorArgs.length - 1]))
      }
      // use provided constructor
      else {
        Contract = sourceOrConstructor
        args = constructorArgs
      }

      // return a promise of a new contract instance
      Contract.new(...args, (err, contract) => {
        if (err) {
          reject(err)
        } else if (contract.address) {
          resolve(contract)
        }
      })
    })
  }
}
