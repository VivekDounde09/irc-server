const { getLatestBlockNumber, getContractInstance, contractJsonInterfaces, contracts } = require('../../services/web3');
const { getContractDetailsModel } = require('../adminRoute/adminModel');
const { IRA } = require('../../services/contracts/index');
const { getZeroAddress } = require('../../services/web3');
const { default: axios } = require('axios');
const { sleep } = require('../../services/pinata');


const getTokenURI = async (contractInstance, tokenId) => {
  return await contractInstance.methods.tokenURI(tokenId).call().catch((err) => err);
};

const fetchMetadata = async (uri) => {

  try {
    const metadata = await axios.get(uri, {
      headers: {
        'Accept': 'text/plain'
      }
    })
    return metadata
  }
  catch (e) {
    if (e?.response?.status == 404) {
      const splitUri = uri.split('/');
      const tokenUri = `https://ipfs.io/ipfs/${splitUri[splitUri.length - 1]}`;
      return fetchMetadata(tokenUri);
    }
  };

  // if (metadata instanceof Error) {
  //   console.log(metadata?.response?.data)
  //   // if (metadata?.response?.data?.includes('mime:')) {
  //   //   const splitUri = uri.split('/');
  //   //   const tokenUri = `https://ipfs.io/ipfs/${splitUri[splitUri.length - 1]}`;
  //   //   console.log(tokenUri);

  //   //   await sleep(5000);
  //   //   await fetchMetadata(tokenUri);
  //   // }
  //   // else {
  //   console.log(uri, metadata.message);
  //   return metadata;
  //   // }
  // }
  // else {
  //   return metadata;
  // }

}


const mintToken = async (tokenId, contract, event) => {
  const contractInstance = getContractInstance(IRA, contract);
  const tokenURI = await getTokenURI(contractInstance, String(tokenId));
  const splitURI = tokenURI.split('/');

  const uri = `https://gateway.lighthouse.storage/ipfs/${splitURI[splitURI.length - 1]}`;

  await sleep(2000);

  const metadata = await fetchMetadata(uri);

  if (metadata instanceof Error) {
    return metadata;
  }

  const insertSql = `INSERT INTO mint_properties_data(token_id,uri, contract, last_sync_block,property_id,current_owner) VALUES('${tokenId}', '${tokenURI}', '${contract}', '${event.blockNumber}', '${metadata?.data?.propertyId}','${event.returnValues.to}')`;

  const response = await DBQuery(insertSql);

  if (response instanceof Error) return response;

  const generateTokenActivity = `INSERT INTO token_activity(token_id,property_id,transfer_event,transfer_from,transfer_to,quantity,gas,transaction_hash) VALUES ('${tokenId}','${metadata?.data?.propertyId}' ,'MINT','${event.returnValues.from}','${event.returnValues.to}',1,'${event?.gasUsed || 0}', '${event.transactionHash}' ) ON DUPLICATE KEY UPDATE property_id = '${metadata?.data?.propertyId}', updated_at = CURRENT_TIMESTAMP`;

  const tokenActivityResponse = await DBQuery(generateTokenActivity);

  if (tokenActivityResponse instanceof Error) {
    return tokenActivityResponse;
  }
  else {
    return true;
  }
};


const transferToken = async (from, to, tokenId, amount, contract, event) => {
  const tokenStandard = 'ERC721';
  const transferAmount = 1;

  const searchSql = `SELECT * FROM mint_properties_data WHERE contract='${contract}' AND token_id='${tokenId}'`;

  const token = await DBQuery(searchSql);

  if (token instanceof Error) { console.log(token); return token; }

  if (token.length > 0) {
    // Check last sync block
    if (event.blockNumber < token[0].last_sync_block) return new Error('Event block have less value compared to token last sync block');

    else {
      const response = await DBQuery(`UPDATE mint_properties_data SET current_owner='${to}' ,updated_at=CURRENT_TIMESTAMP WHERE token_id=${tokenId}`);

      if (response instanceof Error) {
        console.log(response);
        return response;
      }
      else {

        const generateTokenActivity = `INSERT INTO token_activity(token_id,property_id, transfer_event,transfer_from,transfer_to,quantity,gas,transaction_hash) VALUES ('${tokenId}',${token[0].property_id}, 'TRANSFER','${from}','${to}',1,'${event?.gasUsed || 0}', '${event.transactionHash}' ) ON DUPLICATE KEY UPDATE property_id = ${token[0].property_id}, updated_at = CURRENT_TIMESTAMP`;

        const tokenActivityResponse = await DBQuery(generateTokenActivity);

        if (tokenActivityResponse instanceof Error) {
          return tokenActivityResponse;
        }
        else {
          return true;
        }
      }
    }
  } else {
    if (from === getZeroAddress()) {
      const mintedToken = await mintToken(tokenId, contract, event);

      if (mintedToken instanceof Error) { console.log(mintedToken?.response?.data); return mintedToken; }
    } else {
      return true;
    }
  }
};

const transferSingle = async (syncContract, event) => {
  const { from, to, id, tokenId, value } = event.returnValues;

  return await transferToken(
    from,
    to,
    String(tokenId || id),
    value,
    syncContract.contract,
    event
  );
};


const contractSubscriptions = {
  'ERC721': [
    { event: 'Transfer', handler: transferSingle },
  ]
};

const updateContractLastSyncBlock = async (syncContract, lastSyncBlock) => {
  if (syncContract.last_sync_block < lastSyncBlock) {

    const updateSql = `UPDATE sync_contract SET last_sync_block='${lastSyncBlock}', last_sync_block_batch=0 WHERE id=${syncContract.id}`;

    const response = await DBQuery(updateSql);

    if (response instanceof Error) {
      return false;
    } else {
      return true;
    }
  } else if (syncContract.lastSyncBlock > lastSyncBlock) {
    return new Error(`Sync contract with _id: ${syncContract.id} have last sync block greater than new last sync block, May be due to block sync inconsistency`);
  }
};

const sync = async () => {
  const latestBlockNumber = await getLatestBlockNumber();
  const syncContract = await getContractDetailsModel();

  if (!syncContract) {
    return false;
  }

  if (syncContract.last_sync_block < latestBlockNumber) {

    const blockBatchSize = 3000;
    const eventBatchSize = 200;

    const contractInstance = getContractInstance(contractJsonInterfaces['MINT'], contracts['BNB']['MINT']);

    let blockSyncIteration = Math.ceil((latestBlockNumber - syncContract.last_sync_block) / blockBatchSize);

    console.log(`Chain: BNB :: Syncing ${latestBlockNumber - syncContract.last_sync_block} blocks for contract ${syncContract.contract}`);

    while (blockSyncIteration > 0) {
      const toBlock = (syncContract.last_sync_block + blockBatchSize) >= latestBlockNumber ? latestBlockNumber : syncContract.last_sync_block + blockBatchSize;

      const events = await contractInstance.getPastEvents('Transfer', {
        fromBlock: syncContract.last_sync_block + 1,
        toBlock
      }).catch((err) => err);


      if (events instanceof Error) return events;

      // Contract event & event handlers map
      const syncEventHandlers = contractSubscriptions['ERC721'];

      // Event queue to process in a batch
      const eventQueue = [];

      // Filter events
      for (let i = 0; i < events.length; i++) {
        for (const syncEventHandler of syncEventHandlers) {
          if (events[i].event === syncEventHandler.event) {
            eventQueue.push(events[i]);
          }
        }
      }

      if (eventQueue.length) {
        let processedEventCount = 0;

        while (processedEventCount < eventQueue.length) {
          const currentSyncBlock = eventQueue[processedEventCount].blockNumber;
          const currentSyncBlockEvents = [];

          // Aggregate events of current sync block
          for (let i = processedEventCount; i < eventQueue.length; i++) {
            if (currentSyncBlockEvents.length) {
              if (currentSyncBlock === eventQueue[i].blockNumber) {
                currentSyncBlockEvents.push(eventQueue[i]);
              } else {
                break;
              }
            } else {
              currentSyncBlockEvents.push(eventQueue[i]);
            }
            processedEventCount++;
          }

          let eventSyncIteration = Math.ceil(currentSyncBlockEvents.length / eventBatchSize);

          // Exclude processed event sync iterations
          eventSyncIteration -= syncContract.last_sync_block_batch;


          while (eventSyncIteration > 0) {
            const fromIndex = syncContract.last_sync_block_batch * eventBatchSize;
            const toIndex = (fromIndex + eventBatchSize) > currentSyncBlockEvents.length ? currentSyncBlockEvents.length : (fromIndex + eventBatchSize);

            for (let i = fromIndex; i < toIndex; i++) {
              for (const syncEventHandler of syncEventHandlers) {
                if (currentSyncBlockEvents[i].event === syncEventHandler.event) {
                  const response = await syncEventHandler.handler(syncContract, currentSyncBlockEvents[i]);
                  if (response instanceof Error) {
                    return response;
                  }
                }
              }
            }

            // Update sync contract last sync block batch

            const sql = `UPDATE sync_contract SET last_sync_block_batch= last_sync_block_batch+1`;

            const response = await DBQuery(sql);

            if (response instanceof Error) {
              return response;
            }

            eventSyncIteration--;
          }

          // Update sync contract last sync block
          const updatedSyncContract = await updateContractLastSyncBlock(syncContract, currentSyncBlock);

          if (!updatedSyncContract) return false;

          syncContract.last_sync_block = currentSyncBlock;
          syncContract.last_sync_block_batch = 0;
        }
      }

      const updatedSyncContract = await updateContractLastSyncBlock(syncContract, toBlock);
      if (!updatedSyncContract) return false;

      syncContract.last_sync_block = toBlock;
      syncContract.last_sync_block_batch = 0;

      blockSyncIteration--;

    }

    console.log(`Chain: BNB :: Sync completed for contract ${syncContract.contract}`);
  }
}


module.exports = { sync };