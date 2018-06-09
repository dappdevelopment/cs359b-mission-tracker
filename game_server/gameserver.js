const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const MissionTrackerJson = require('./contracts/MissionTracker.json');

const app = express();

//5001 is the necessary port for communication between Docker image and local machine
const port = process.env.PORT || 5001;

const providerUrl = 'https://rinkeby.infura.io/N9Txfkh1TNZhoeKXV6Xm';

//Game wallet public and private key
const gamePublicKey = process.env.public;
const gamePrivateKey = process.env.private;

/* 
Testing
const temp_public = '0x1CE1fa37c955F8f48cf5Cff659eb0885874BBa7b';
const temp_private = new Buffer('568eb8f8bae05aa41fc9f23eb43daf1043d3b0a0a6994c581be26e521c00c277', 'hex');
*/

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
    app.listen(port, () => console.log(`Site server on port ${port}`));
})
.catch(console.error);

/*
	Called when the server receives an HTTP GET method with a complete_checkpoint URL. The server issues 
	a web3 call to the contract to set a checkpoint to complete, which mints a new token and adds it to 
	the reviewer's wallet, determined by the reviewerId.
	The transaction is signed with the game private key.
*/ 
app.get('/api/complete_checkpoint/:reviewer/:checkpoint', (req, res) => {
    let reviewerId = req.params.reviewer;
    let checkpointId = req.params.checkpoint;
    let encodedABI = contract.methods.setCheckpointComplete(reviewerId, checkpointId).encodeABI();

    web3.eth.getTransactionCount(gamePublicKey, 'pending')
    .then(nonce => {
        let rawTx = {
            from: gamePublicKey,
            to: contractAddress,
            gas: 2000000,
            data: encodedABI,
            gasPrice: '100',
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

/*
	Called when the server receives an HTTP GET method with a add_checkpoint URL. The server issues 
	a web3 call to the contract to register the existence of a new checkpoint for a game. It is helpful
	to list all checkpoints to determine what a reviewer is able to complete.
	The transaction is signed with the game private key.
*/ 
app.get('/api/add_checkpoint/:checkpoint_name', (req, res) => {
    let checkpointName = decodeURIComponent(req.params.checkpoint_name);
    let encodedABI = contract.methods.addGameCheckpoint(checkpointName).encodeABI();

    web3.eth.getTransactionCount(gamePublicKey, 'pending')
    .then(nonce => {
        let rawTx = {
            from: gamePublicKey,
            to: contractAddress,
            gas: 2000000,
            data: encodedABI,
            gasPrice: '100',
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
