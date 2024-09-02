require('dotenv').config();
const Web3 = require('web3');
const { IRA, IRA369, ExchangeToken, USDT } = require('./contracts/index');
const { ethers } = require('ethers');
const { uploadOnLighthouse } = require('../services/pinata');

// const { updatePropertyMint } = require('../api/adminRoute/adminModel');


const web3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTPS_BNB_PROVIDER));

const getPrivateKey = async () => {
  const mnemonic = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
  return mnemonic.privateKey;
}


const accountNonce = async (address) => {
  let transactionCount = await web3.eth.getTransactionCount(address);
  const random = Math.floor((Math.random() + 1) * 100000);
  transactionCount += random;
  const nonce = '0x' + transactionCount.toString(16);
  return nonce;
}


const contracts = {
  BNB: {
    MINT: process.env.CONTRACT_ADDRESS,
    BALANCE: '0x4300BB96d9aeE0fAD62b4c2Aeb614c258E374f20',
    TOKEN_EXCHANGE: '0x34fA21B5AB37a36241AE6B8007636a7e1342B338',
    USDT: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
  }
}
const getProvider = (chain, type) => {
  const options = {
    // Enable auto reconnection
    reconnect: {
      auto: true,
      delay: 5000, // ms
      maxAttempts: 5,
      onTimeout: false
    }
  }
  if (chain === 'ETHEREUM') {
    if (type && type === 1) {
      return new Web3.providers.WebsocketProvider(process.env.WSS_ETHEREUM_PROVIDER || '', options);
    } else {
      return new Web3.providers.HttpProvider(process.env.HTTPS_ETHEREUM_PROVIDER || '');
    }
  } else if (chain === 'POLYGON') {
    if (type && type === 1) {
      return new Web3.providers.WebsocketProvider(process.env.WSS_POLYGON_PROVIDER || '', options);
    } else {
      return new Web3.providers.HttpProvider(process.env.HTTPS_POLYGON_PROVIDER || '');
    }
  } else if (chain === 'BNB') {
    if (type && type === 1) {
      return new Web3.providers.WebsocketProvider(process.env.WSS_BNB_PROVIDER || '', options);
    } else {
      return new Web3.providers.HttpProvider(process.env.HTTPS_BNB_PROVIDER || '');
    }
  } else {
    return null;
  }
}

const wallets = {
  BNB: new Web3(getProvider('BNB', 0)).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY || '')
};

const contractJsonInterfaces = {
  MINT: IRA,
  BALANCE: IRA369,
  TOKEN_EXCHANGE: ExchangeToken,
  USDT
}

const isValidAuthorizer = async (address) => {
  return await web3.utils.toChecksumAddress(address) === web3.utils.toChecksumAddress(process.env.PUBLIC_KEY);
}

const getChecksumAddress = async (address) => {
  return await web3.utils.toChecksumAddress(address);
}


const getZeroAddress = () => {
  return '0x0000000000000000000000000000000000000000';
};

const getLatestBlockNumber = async () => {
  return await web3.eth.getBlockNumber();
}

const getContractInstance = (contractJson, address) => {
  const contractAddress = web3.utils.toChecksumAddress(address);
  let contract = new web3.eth.Contract(contractJson, contractAddress);
  return contract;
}

const getTransactionGasFees = async (transactionHash) => {
  const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash).catch((err) => err);

  if (transactionReceipt instanceof Error) {
    return transactionReceipt;
  }
  const gas = Number(web3.utils.fromWei(`${transactionReceipt.gasUsed * transactionReceipt.effectiveGasPrice}`))
  return gas;
}

const updatePropertyMint = async (id, amount, receipt, status) => {
  if (status) {
    const updateSql = `UPDATE properties SET is_minted='1', total_minted='${amount}' WHERE property_id=${id}`;

    const response = await DBQuery(updateSql);

    if (response instanceof Error) {
      return false;
    }
    return true;

  }
  else {
    const updateSql = `UPDATE properties SET total_minted='${amount}', is_minted = 10 WHERE property_id=${id}`;

    const response = await DBQuery(updateSql);

    if (response instanceof Error) {
      return false;
    }

    else {
      return false;
    }
  }
}


const getTokenBalance = async (address, tokenId) => {
  const contract = getContractInstance(contractJsonInterfaces['BALANCE'], contracts['BNB']['BALANCE']);

  const response = await contract.methods.balanceOf(address).call().catch(err => err);
  if (response instanceof Error) {
    return response;
  } else {
    const balance = web3.utils.fromWei(response)
    return balance;
  }

};

const isApprovedForAll = async (address) => {

  const contract = getContractInstance(contractJsonInterfaces['BALANCE'], contracts['BNB']['BALANCE']);
  const response = await contract.methods.allowance(address, process.env.PUBLIC_KEY).call().catch(err => err);
  if (response instanceof Error) {
    return false;
  }
  else {
    return await web3.utils.fromWei(response.toString());
  }
};

const sendRawTransaction = async (chain, from, to, value, data) => {

  // const privateKey = await getPrivateKey();
  const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

  const tx = {};
  tx.from = from;
  tx.to = to;
  if (Number(value) > 0) {
    tx.value = web3.utils.toWei(value.toString())
  }
  if (data) {
    tx.data = data;
  }
  try {
    tx.gas = await web3.eth.estimateGas(tx);

  }
  catch (error) {
    return new Error(error);
  }

  const signedTx = await wallet.signTransaction(tx).catch((err) => err);

  if (signedTx instanceof Error) return signedTx;

  if (signedTx.rawTransaction) {
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).catch(err => err);
    return receipt;
  } else {
    return new Error('Signed transaction have undefined rawTransaction');
  }
}

const getAuthConsentMessage = (address, nonce) => {
  return `Welcome to IRA!\n\nClick to sign in and accept the IRA Terms of Service: ${process.env.CLIENT_URL}/tos\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status will reset after 24 hours.\n\nWallet address:\n${web3.utils.toChecksumAddress(address)}\n\nNonce:\n${nonce}`;
};


const mintNFT = async (stringUri, supply) => {
  const contract = getContractInstance(contractJsonInterfaces['MINT'], contracts['BNB']['MINT']);

  // const privateKey = await getPrivateKey();

  const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

  // const nonce = await web3.eth.getTransactionCount(process.env.PUBLIC_KEY, "latest");

  const tx = {
    to: process.env.CONTRACT_ADDRESS,
    data: contract.methods.mint(web3.utils.stringToHex(stringUri), supply).encodeABI()
  }
  tx.from = wallet.address;

  const gas = await web3.eth.estimateGas(tx);
  tx.gas = gas;
  const signedTx = await wallet.signTransaction(tx).catch((err) => err);

  if (signedTx instanceof Error) {
    return signedTx;
  }
  if (signedTx.rawTransaction) {
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return receipt;
  } else {
    return new Error('Signed transaction have undefined rawTransaction');
  }
}

const batchMint = async (data) => {

  if (data) {
    const supply = data.total_number_of_fraction - data.total_minted;

    try {
      const to = contracts['BNB']['MINT'];
      // const privateKey = await getPrivateKey();
      const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);
      if (wallet) {

        const contract = getContractInstance(contractJsonInterfaces['MINT'], contracts['BNB']['MINT']);

        /*Upload on Pinata */
        let stringUris = await uploadOnLighthouse(data, supply);

        if (stringUris instanceof Error) {
          return stringUris;
        }

        /*Create Array of Max Optimized*/

        let _supplyDecreasing = supply;
        while (_supplyDecreasing !== 0) {
          for (let i = 1; i <= _supplyDecreasing; i++) {
            const _tx = {};

            _tx.from = wallet.address;
            _tx.to = to;
            _tx.data = await contract.methods.batchMint(stringUris, i).encodeABI();
            _tx.gas = await web3.eth.estimateGas(_tx) || ''; //catch handle

            if (ethers.BigNumber.from(_tx.gas).gt(ethers.BigNumber.from(14000000))) {

              let _stringUris = stringUris.slice(0, i - 1);
              const __tx = {};

              __tx.from = wallet.address;
              __tx.to = to;
              __tx.data = contract.methods.batchMint(_stringUris, i - 1).encodeABI();
              __tx.gas = await web3.eth.estimateGas(__tx) || '';     //catch handle

              const signedTx = await wallet.signTransaction(__tx).catch((err) => err);

              if (signedTx instanceof Error) return signedTx;

              if (signedTx.rawTransaction) {

                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

                if (receipt instanceof Error) {
                  console.log({ status: 'failure', totalMint: supply - _supplyDecreasing, error: receipt });
                  return receipt;
                };

                await updatePropertyMint(data.property_id, supply - _supplyDecreasing, receipt, false);
                _supplyDecreasing = _supplyDecreasing - (i - 1);
                stringUris.slice(i - 1, stringUris.length);
                break;

              } else {
                console.log({ status: 'failure', totalMint: 0, error: 'Signed transaction have undefined rawTransaction' });
                return new Error('Signed transaction have undefined rawTransaction');
              }
            } else if (i == _supplyDecreasing) {
              const __tx = {};

              __tx.from = wallet.address;
              __tx.to = to;
              __tx.data = contract.methods.batchMint(stringUris, i).encodeABI();
              __tx.gas = await web3.eth.estimateGas(__tx) || '';

              const signedTx = await wallet.signTransaction(__tx).catch((err) => err);

              if (signedTx instanceof Error) return signedTx;

              if (signedTx.rawTransaction) {
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

                if (receipt instanceof Error) {
                  //await updatePropertyMint(data.property_id, supply - _supplyDecreasing, receipt, false);
                  return receipt;
                }
                await updatePropertyMint(data.property_id, supply, receipt, true);
                _supplyDecreasing = _supplyDecreasing - i;
                return true;
              } else {
                console.log({ status: 'failure', totalMint: 0, error: 'Signed transaction have undefined rawTransaction' });
                return new Error('Signed transaction have undefined rawTransaction');
              }
            }
          }
        }
      } else {
        console.error(new Error('Wallet not exist'));
      }
    } catch (error) {
      console.error(error);
      return new Error('Something went wrong, Please contact to administrator');
    }
  }
}

const whitelistUser = async (address) => {

  const contract = getContractInstance(contractJsonInterfaces['MINT'], contracts['BNB']['MINT']);

  // const privateKey = await getPrivateKey();
  const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

  const tx = {
    to: contracts['BNB'].MINT,
    data: contract.methods.addToWhitelist([address]).encodeABI()
  }
  tx.from = wallet.address;

  const gas = await web3.eth.estimateGas(tx);
  tx.gas = gas;

  const signedTx = await wallet.signTransaction(tx).catch((err) => err);

  if (signedTx instanceof Error) {
    return false;
  }
  if (signedTx.rawTransaction) {
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return true;
  } else {
    return false;
  }

}

const isUSDTApproved = async (address) => {

  const contract = getContractInstance(contractJsonInterfaces['USDT'], contracts['BNB']['USDT']);

  const response = await contract.methods.allowance(address, contracts['BNB']['TOKEN_EXCHANGE']).call().catch(err => err);
  if (response instanceof Error) {
    return false;
  }
  else {
    return await web3.utils.fromWei(response.toString());
  }
}



const checkTokensInVault = async (token) => {
  const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

  // const privateKey = await getPrivateKey();
  const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

  let response;

  if (token === 'IRA') {
    response = await contract.methods.checkTokenBalance().call({ from: wallet.address }).catch(err => err);

  }
  else if (token === 'EXCHANGE') {
    response = await contract.methods.checkUSDTBalance().call({ from: wallet.address }).catch(err => err);
  }

  if (response instanceof Error) {
    return response;
  } else {
    const balance = web3.utils.fromWei(response)
    return balance;
  }

}

const checkExchangeRate = async () => {
  const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

  // const privateKey = await getPrivateKey();
  const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

  const response = await contract.methods.exchangeRate().call({ from: wallet.address }).catch(err => err);

  if (response instanceof Error) {
    return response;
  } else {
    return response;
  }

}

const withDrawIRAFromVault = async (amount, address) => {
  const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

  // const privateKey = await getPrivateKey();
  const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

  const tx = {
    to: contracts['BNB'].TOKEN_EXCHANGE,
    data: contract.methods.withdrawTokens(web3.utils.toWei(amount.toString()), address).encodeABI()
  }
  tx.from = wallet.address;

  const gas = await web3.eth.estimateGas(tx);
  tx.gas = gas;

  const signedTx = await wallet.signTransaction(tx).catch((err) => err);

  if (signedTx instanceof Error) {
    return false;
  }
  if (signedTx.rawTransaction) {
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return true;
  } else {
    return false;
  }
}

const withDrawExchangeTokenFromVault = async (amount, address) => {
  try {
    const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

    // const privateKey = await getPrivateKey();
    const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

    const tx = {
      to: contracts['BNB'].TOKEN_EXCHANGE,
      data: contract.methods.withdrawExchangeTokens(web3.utils.toWei(amount.toString()), address).encodeABI()
    }
    tx.from = wallet.address;

    const gas = await web3.eth.estimateGas(tx);
    tx.gas = gas;

    const signedTx = await wallet.signTransaction(tx).catch((err) => err);

    if (signedTx instanceof Error) {
      return signedTx;
    }
    if (signedTx.rawTransaction) {
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return receipt;
    } else {
      return new Error('Unable to Find raw transaction');
    }

  } catch (error) {
    console.log(error);
    return error
  }

}


const changeExchangeRate = async (rate) => {

  try {

    const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

    // const privateKey = await getPrivateKey();
    const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

    const tx = {
      to: contracts['BNB'].TOKEN_EXCHANGE,
      data: contract.methods.changeExchangeRate(rate.toString()).encodeABI()
    }
    tx.from = wallet.address;

    const gas = await web3.eth.estimateGas(tx);
    tx.gas = gas;

    const signedTx = await wallet.signTransaction(tx).catch((err) => err);

    if (signedTx instanceof Error) {
      return false;
    }
    if (signedTx.rawTransaction) {
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }

}


const addIRAToken = async (amount) => {
  try {
    const contract = getContractInstance(contractJsonInterfaces['BALANCE'], contracts['BNB']['BALANCE']);

    // const privateKey = await getPrivateKey();
    const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

    const tx = {
      to: contracts['BNB'].BALANCE,
      data: contract.methods.transferFrom(process.env.PUBLIC_KEY, contracts['BNB']['TOKEN_EXCHANGE'], web3.utils.toWei(amount.toString())).encodeABI()
    }
    tx.from = wallet.address;

    const gas = await web3.eth.estimateGas(tx);
    tx.gas = gas;

    const signedTx = await wallet.signTransaction(tx).catch((err) => err);

    if (signedTx instanceof Error) {
      return signedTx;
    }
    if (signedTx.rawTransaction) {
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return receipt;
    } else {
      return signedTx;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}


const transferTokens = async (address, amount) => {

  try {
    const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

    // const privateKey = await getPrivateKey();
    const wallet = new Web3(process.env.HTTPS_BNB_PROVIDER).eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

    const tx = {
      to: contracts['BNB'].TOKEN_EXCHANGE,
      data: contract.methods.exchangeTokens(web3.utils.toWei(amount.toString()), address, address).encodeABI()
    }
    tx.from = wallet.address;

    const gas = await web3.eth.estimateGas(tx);
    tx.gas = gas;

    const signedTx = await wallet.signTransaction(tx).catch((err) => err);

    if (signedTx instanceof Error) {
      return signedTx;
    }
    if (signedTx.rawTransaction) {
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      return receipt;
    } else {
      return receipt;
    }
  } catch (error) {
    console.log(error);
    return error
  }

}

const getBlockNumber = async () => {
  const block = await web3.eth.getTransactionReceipt('0x5173b309659f54692e99631600c3e311b73a449c0f1b49c59df7fcbc67ae6852');
  return block.blockNumber;
}


const eventsTransactionDetails = async () => {
  const contract = getContractInstance(contractJsonInterfaces['TOKEN_EXCHANGE'], contracts['BNB']['TOKEN_EXCHANGE']);

  const fromBlockNumber = await getBlockNumber();
  const latestBlock = await getLatestBlockNumber();

  contract.getPastEvents('Transfer', {
    filter: { from: '0x0000000000000000000000000000000000000000' }, // Using an array means OR: e.g. 20 or 23
    fromBlock: fromBlockNumber,
    toBlock: latestBlock
  })
    .then(async function (events) {
      // console.log(events);
      events.forEach(async (event) => {
        // console.log('done', event);
      })
    });


}


const getBalanceOfUSDT = async (address) => {
  const contract = getContractInstance(contractJsonInterfaces['USDT'], contracts['BNB']['USDT']);

  const response = await contract.methods.balanceOf(address).call().catch(err => err);
  if (response instanceof Error) {
    return response;
  } else {
    const balance = web3.utils.fromWei(response)
    return balance;
  }
}





module.exports = { web3, getAuthConsentMessage, mintNFT, getZeroAddress, getLatestBlockNumber, getContractInstance, contractJsonInterfaces, contracts, batchMint, whitelistUser, isValidAuthorizer, getTokenBalance, isApprovedForAll, sendRawTransaction, accountNonce, checkTokensInVault, withDrawIRAFromVault, withDrawExchangeTokenFromVault, getChecksumAddress, changeExchangeRate, addIRAToken, checkExchangeRate, isUSDTApproved, transferTokens, eventsTransactionDetails, getBalanceOfUSDT };