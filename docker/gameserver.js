const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const MissionTrackerJson = require('./contracts/MissionTracker.json');

const app = express();
const port = process.env.PORT || 5001;
const providerUrl = 'https://rinkeby.infura.io/N9Txfkh1TNZhoeKXV6Xm';
const gamePublicKey = process.env.public;
const gamePrivateKey = process.env.private;

const temp_public = '0x1CE1fa37c955F8f48cf5Cff659eb0885874BBa7b';
const temp_private = new Buffer('568eb8f8bae05aa41fc9f23eb43daf1043d3b0a0a6994c581be26e521c00c277', 'hex');
const production = true;

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

if (production) {
    app.use('/', express.static(`${__dirname}/client/build`));
}

app.get('/api/complete_checkpoint/:reviewer/:checkpoint', (req, res) => {
    let reviewerId = req.params.reviewer;
    let checkpointId = req.params.checkpoint;
    let encodedABI = contract.methods.setCheckpointComplete(reviewerId, checkpointId).encodeABI();

	console.log("reached here : ");
	console.log( gamePublicKey);


    //web3.eth.getTransactionCount(gamePublicKey, 'pending')
    web3.eth.getTransactionCount(temp_public, 'pending')
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
        tx.sign(temp_private);
        //tx.sign(gamePrivateKey);
    
        let serializedTx = tx.serialize();
    
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', console.log)
        .catch(console.error);
    })
});

app.get('/api/add_checkpoint/:checkpoint_name', (req, res) => {
	console.log("hello");
    let checkpointName = decodeURIComponent(req.params.checkpoint_name);
    let encodedABI = contract.methods.addGameCheckpoint(checkpointName).encodeABI();

    //web3.eth.getTransactionCount(gamePublicKey, 'pending')
    web3.eth.getTransactionCount(temp_public, 'pending')
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
        tx.sign(temp_private);
        //tx.sign(gamePrivateKey);
    
        let serializedTx = tx.serialize();
    
        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
        .on('receipt', console.log)
        .catch(console.error);
    })
});
console.log("end");
