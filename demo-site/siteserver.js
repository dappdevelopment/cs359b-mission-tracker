const express = require('express');
const Web3 = require('web3');
const MissionTrackerJson = require('./contracts/MissionTracker.json');

const app = express();
const port = process.env.PORT || 5000;
const providerUrl = 'HTTP://127.0.0.1:7545';
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

    let contractAddress = contractData.networks[networkId].address;
    contract = new web3.eth.Contract(contractData.abi, contractAddress);
    app.listen(port, () => console.log(`Site server on port ${port}`));
})
.catch(console.error);

app.get('/api/get_progress/:game/:reviewer', (req, res) => {
    let gameAddress = req.params.game;
    let reviewerId = req.params.reviewer;
    contract.methods.getGameCheckpointCount(gameAddress).call().then(
        (count) => {
            let funcs = [];
            let checkpointNames = [];
            let checkpointComplete = [];
            for (let i = 0; i < count; i++) {
                funcs.push(() => {
                    return contract.methods.getGameCheckpointName(gameAddress, i).call()
                    .then((name) => checkpointNames.push(name))
                    .then(() => contract.methods.getCheckpointComplete(reviewerId, gameAddress, i).call()
                    .then((complete) => checkpointComplete.push(complete)));
                })
            }
            funcs.reduce((prev, curr) => {
                return prev.then(curr);
            }, Promise.resolve()).then(
                () => {
                    res.send(checkpointNames.map((name, i) => ({
                            name, 
                            completed: checkpointComplete[i],
                        })
                    ));
                }
            )
        }
    )
});