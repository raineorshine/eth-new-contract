import * as chai from 'chai'
import * as ethNewContract from '../index.js'
const should = chai.should()

describe('ethNewContract', () => {
  it('should do something', () => {
    ethNewContract.doSomething().should.equal(12345)
  })
})
