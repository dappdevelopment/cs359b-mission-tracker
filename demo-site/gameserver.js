const express = require('express');
const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const MissionTrackerJson = require('./contracts/MissionTracker.json');

const app = express();
const port = process.env.PORT || 5001;
const providerUrl = 'HTTP://127.0.0.1:7545';
const gamePublicKey = '0x67CDd7Df107747353fa03FB96BB49dAAB064aeCf';
const gamePrivateKey = new Buffer('e3b69803e2c8c2d7dab315397efc6c06dc39766eedaf51cf31ab15bd15a6bdcc', 'hex');
let contractAddress = null;
let contract = null;

let web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
if (typeof web3 === 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
console.log("Using web3 version: " + Web3.version);

let contractDataPromise = MissionTrackerJson;
let networkIdPromise = web3.eth.net.getId(); // resolves on the current network id

Promise.all([contractDataPromise, networkIdPromise])
.then(results => {
    let contractData = results[0];
    let networkId = results[1];

    // Make sure the contract is deployed on the connected network
    if (!(networkId in contractData.networks)) {
        throw new Error("Contract not found in selected Ethereum network on MetaMask.");
    }

    contractAddress = contractData.networks[networkId].address;
    contract = new web3.eth.Contract(contractData.abi, contractAddress);
    app.listen(port, () => console.log(`Game server listening on port ${port}`));
})
.catch(console.error);

app.get('/api/complete_checkpoint/:reviewer/:checkpoint', (req, res) => {
    let reviewerId = req.params.reviewer;
    let checkpointId = req.params.checkpoint;
    let encodedABI = contract.methods.setCheckpointComplete(reviewerId, checkpointId).encodeABI();

    web3.eth.getTransactionCount(gamePublicKey)
    .then(nonce => {
        let rawTx = {
            from: gamePublicKey,
            to: contractAddress,
            gas: 2000000,
            data: encodedABI,
            nonce,
        };

        let tx = new Tx(rawTx);
        tx.sign(gamePrivateKey);
    
        let serializedTx = tx.serialize();
    
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', console.log)
        .catch(console.error);
    })
});