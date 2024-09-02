const { web3 } = require('../../services/web3');

const isEqualAddress = (address1, address2) => {
  try {
    return web3.utils.toChecksumAddress(address1) === web3.utils.toChecksumAddress(address2);
  } catch (e) {
    return false;
  }
};

const verifySignature = (message, publicAddress, signature) => {
  try {
    const signer = web3.eth.accounts.recover(message, signature);
    return isEqualAddress(publicAddress, signer);
  } catch (e) {
    return false;
  }
};



module.exports = { isEqualAddress, verifySignature }