module.exports = (Contract, constructorArgs) => {
  return new Promise((resolve, reject) => {
    Contract.new(constructorArgs, (err, contract) => {
      if (err) {
        reject(err)
      } else if (contract.address) {
        resolve(contract)
      }
    })
  })
}
