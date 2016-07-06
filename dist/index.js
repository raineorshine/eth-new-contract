'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _solc = require('solc');

var _solc2 = _interopRequireDefault(_solc);

var _lodash = require('lodash.merge');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (provider) {
  return function (sourceOrConstructor, constructorArgs) {

    var web3 = new _web2.default(provider);

    return new Promise(function (resolve, reject) {
      if (!sourceOrConstructor) {
        throw new Error('No contract source code or constructor provided.');
      }

      var Contract = void 0;
      var args = void 0;

      // source code
      if (typeof sourceOrConstructor === 'string') {
        var source = sourceOrConstructor;
        var contractName = source.match(/contract\s([^\s]*)\s*{/)[1];
        if (!contractName) {
          throw new Error('Could not parse contract name from source.');
        }
        var compilation = _solc2.default.compile(source);
        var bytecode = compilation.contracts[contractName].bytecode;
        var abi = JSON.parse(compilation.contracts[contractName].interface);

        Contract = web3.eth.contract(abi);
        args = (0, _lodash2.default)({ data: bytecode }, constructorArgs);
      }
      // constructor
      else {
          Contract = sourceOrConstructor;
          args = constructorArgs;
        }

      // return a promise of a new contract instance
      Contract.new(args, function (err, contract) {
        if (err) {
          reject(err);
        } else if (contract.address) {
          resolve(contract);
        }
      });
    });
  };
};