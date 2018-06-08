const express = require('express');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const MissionTrackerJson = require('./contracts/MissionTracker.json');
const Path = require('path');

const app = express();
const port = 5000;
const providerUrl = 'https://rinkeby.infura.io/N9Txfkh1TNZhoeKXV6Xm';
// const providerUrl = 'http://127.0.0.1:7545';

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

app.get('/missiontracker/api/register_game/:name', (req, res) => {
    let name = req.params.name;

    contract.methods.registerGame(decodeURIComponent(name)).send({from: userAccount})
    .then((receipt) => {
        res.send(receipt);
    });
});

// TODO: currently will only detect rewards issues by the game, not by any other game
app.get('/missiontracker/api/get_progress/:player', (req, res) => {
    let playerId = req.params.player;

    let ownedTokenIds = null;
    let playedGameIds = null;
    let playedGameAddresses = null;
    const addressToName = {};
    const allowedRewardNames = {};
    const allowedRewardIds = {};

    contract.methods.balanceOf(playerId).call()
    .then((balance) => {
        let funcs = [];
        for (let i = 0; i < balance; i++) {
            funcs.push(contract.methods.tokenOfOwnerByIndex(playerId, i).call());
        }
        return Promise.all(funcs);
    })
    .then((tokenIds) => {
        ownedTokenIds = tokenIds;
        return Promise.all(tokenIds.map(tokenId => {
            return contract.methods.getTokenCreator(tokenId).call();
        }));
    })
    .then((tokenCreators) => {
        playedGameAddresses = Array.from(new Set(tokenCreators));
        return Promise.all(tokenCreators.map(tokenCreator => {
            return contract.methods.getGameName(tokenCreator).call();
        }))
    })
    .then((gameNames) => {
        playedGameNames = gameNames;
        return Promise.all(playedGameAddresses.map(gameAddress => {
            return contract.methods.getAllowedRewards(gameAddress).call();
        }));
    })
    .then((rewardIdArrays) => {
        rewardIdArrays.forEach((rewardIds, i) => {
            allowedRewardIds[playedGameAddresses[i]] = rewardIds;
        });
    })
    .then(() => {
        let funcs = [];
        playedGameAddresses.forEach((gameAddress) => {
            funcs.push(Promise.all(allowedRewardIds[gameAddress].map(rewardId => {
                return contract.methods.getRewardName(rewardId).call();
            })));
        });
        return Promise.all(funcs);
    })
    .then((rewardNameArrays) => {
        rewardNameArrays.forEach((rewardNames, i) => {
            allowedRewardNames[playedGameAddresses[i]] = rewardNames;
        })
    })
    .then(() => {
        return Promise.all(playedGameAddresses.map(address => {
            return contract.methods.getGameName(address).call();
        }));
    })
    .then((gameNames) => {
        gameNames.map((name, i) => {
            addressToName[playedGameAddresses[i]] = name;
        });
    })
    .then(() => {
        return Promise.all(ownedTokenIds.map(tokenId => {
            return contract.methods.getTokenReward(tokenId).call();
        }));
    })
    .then((rewardIds) => {
        const rewardIdSet = new Set(rewardIds);
        const progress = {};
        Object.entries(allowedRewardIds).forEach(([gameAddress, rewardIds]) => {
            let rewards = [];
            for (let i = 0; i < rewardIds.length; i++) {
                    if (rewardIdSet.has(rewardIds[i])) {
                        rewards.push({
                            name: allowedRewardNames[gameAddress][i],
                            owned: true,
                        })
                    }
            }
            progress[gameAddress] = {
                progress: rewards,
                gameName: addressToName[gameAddress],
            };
        });
        return progress;
    })
    .then((progress) => {
        res.send(progress);
    });
});