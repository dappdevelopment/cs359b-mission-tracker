function app() {
    if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
    web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
    console.log("Using web3 version: " + Web3.version);
  
    var contract;
    var userAccount;
  
    var contractDataPromise = $.getJSON('MissionTracker.json');
    var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
    var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  
    Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
      .then(function initApp(results) {
        var contractData = results[0];
        var networkId = results[1];
        var accounts = results[2];
        userAccount = accounts[0];
  
        // Make sure the contract is deployed on the connected network
        if (!(networkId in contractData.networks)) {
            throw new Error("Contract not found in selected Ethereum network on MetaMask.");
        }
 
        var contractAddress = contractData.networks[networkId].address;
        contract = new web3.eth.Contract(contractData.abi, contractAddress);
      })
     .catch(console.error);


    function refreshBalance() { // Returns web3's PromiEvent
       // Calling the contract (try with/without declaring view)
       contract.methods.balanceOf(userAccount).call().then(function (balance) {
         $('#display').text(balance + " CDT");
         $("#loader").hide();
       });
    }

    function addCheckpoint(checkpointName) {
        if (!checkpointName) return console.log('Must specify a checkpoint name');

        $("#loader").show();

        contract.methods.createAndAllowReward(checkpointName).send({from: userAccount})
            .then((receipt) => {
                console.log(receipt);
                $("#loader").hide();
            });
    }

    function registerGame(gameName) {
        if (!gameName) return console.log('Must specify a game name');

        $("#loader").show();

        contract.methods.registerGame(gameName).send({from: userAccount})
            .then((receipt) => {
                console.log(receipt);
                $("#loader").hide();
            });
    }

    function viewGameCheckpoints(gameAddress) {
        if (!gameAddress) return console.log('Must specify a game');

        $("#loader").show();

        contract.methods.getAllowedRewards(gameAddress).call().then(
            (rewardIds) => {
                rewardIds.forEach(rewardId => {
                    contract.methods.getRewardName(rewardId).call().then(
                        console.log
                    )
                });
                $("#loader").hide();
            }
        );
        // contract.methods.getGameCheckpointCount(gameAddress).call().then(
        //     (count) => {
        //         let funcs = [];
        //         let checkpointNames = [];
        //         for (let i = 0; i < count; i++) {
        //             funcs.push(() => {
        //                 return contract.methods.getGameCheckpointName(gameAddress, i).call()
        //                 .then((name) => checkpointNames.push(name));
        //             });
        //         }
        //         funcs.reduce((prev, curr) => {
        //             return prev.then(curr);
        //         }, Promise.resolve()).then(
        //             () => {
        //                 console.log(checkpointNames);
        //                 $("#loader").hide();
        //             }
        //         )
        //     }
        // )
    }

    function viewProgress(gameAddress, reviewerId) {
        // if (!gameAddress || !reviewerId) return console.log('Must specify a game and reviewer id');

        $("#loader").show();

        let playerId = reviewerId;
        let ownedTokenIds = null;
        let playedGameIds = null;
        let playedGameAddresses = null;
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
            return Promise.all(ownedTokenIds.map(tokenId => {
                return contract.methods.getTokenReward(tokenId).call();
            }));
        })
        .then((rewardIds) => {
            let rewardIdSet = new Set(rewardIds);
            Object.entries(allowedRewardIds).forEach(([gameAddress, rewardIds]) => {
                console.log(rewardIds.map((rewardId, i) => ({
                    name: allowedRewardNames[gameAddress][i], 
                    owned: rewardIdSet.has(rewardId),
                })));
            });

            $("#loader").hide();
        });

        // let allowedRewardIds = null;
        // let allowedRewardNames = null;
        // let ownedTokenIds = null;
        // contract.methods.getAllowedRewards(gameAddress).call()
        // .then((rewardIds) => {
        //     allowedRewardIds = rewardIds;
        //     return Promise.all(allowedRewardIds.map(rewardId => {
        //         return contract.methods.getRewardName(rewardId).call();
        //     }));
        // })
        // .then((rewardNames) => {
        //     allowedRewardNames = rewardNames;
        // })
        // .then(() => {
        //     return contract.methods.balanceOf(playerId).call();
        // })
        // .then((balance) => {
        //     let funcs = [];
        //     for (let i = 0; i < balance; i++) {
        //         funcs.push(contract.methods.tokenOfOwnerByIndex(playerId, i).call());
        //     }
        //     return Promise.all(funcs);
        // })
        // .then((tokenIds) => {
        //     ownedTokenIds = tokenIds;
        //     return Promise.all(tokenIds.map(tokenId => {
        //         return contract.methods.getTokenCreator(tokenId).call();
        //     }));
        // })
        // .then((tokenCreators) => {
        //     return ownedTokenIds.filter((tokenId, i) => tokenCreators[i] === gameAddress);
        // })
        // .then((tokenIds) => {
        //     return Promise.all(tokenIds.map(tokenId => {
        //         return contract.methods.getTokenReward(tokenId).call();
        //     }));
        // })
        // .then((rewardIds) => {
        //     console.log(rewardIds, allowedRewardIds);
        //     let ownedRewards = new Set(rewardIds);
        //     return allowedRewardIds.map(rewardId => ownedRewards.has(rewardId));
        // })
        // .then((rewardIsOwned) => {
        //     console.log(allowedRewardNames.map((name, i) => ({
        //         name, 
        //         owned: rewardIsOwned[i],
        //     })));
        // });
        // contract.methods.balanceOf(reviewerId).call().then(balance => {
        //         for (let i = 0; i < balance; i++) {
        //             contract.methods.tokenOfOwnerByIndex(reviewerId, i).call().then(tokenId => {
        //                     contract.methods.getTokenCreator(tokenId).call().then(creator => {
        //                         if (creator === gameAddress) {
        //                             contract.methods.getTokenReward(tokenId).call().then(rewardId => {
        //                                 contract.methods.getRewardName(rewardId).call().then(console.log);
        //                             })
        //                         }
        //                     })
        //                 }
        //             )
        //         }
        //     }
        // )

        // contract.methods.tokenOfOwnerByIndex(reviewerId, 0).call().then(
        //     console.log
        // );
        // contract.methods.getGameCheckpointCount(gameAddress).call().then(
        //     (count) => {
        //         let funcs = [];
        //         let checkpointNames = [];
        //         let checkpointComplete = [];
        //         for (let i = 0; i < count; i++) {
        //             funcs.push(() => {
        //                 return contract.methods.getGameCheckpointName(gameAddress, i).call()
        //                 .then((name) => checkpointNames.push(name))
        //                 .then(() => contract.methods.getCheckpointComplete(reviewerId, gameAddress, i).call()
        //                 .then((complete) => checkpointComplete.push(complete)));
        //             })
        //         }
        //         funcs.reduce((prev, curr) => {
        //             return prev.then(curr);
        //         }, Promise.resolve()).then(
        //             () => {
        //                 console.log(checkpointNames);
        //                 console.log(checkpointComplete);
        //                 $("#loader").hide();
        //             }
        //         )
        //     }
        // )
    }

    function completeCheckpoint(reviewerId, checkpointId) {
        if (!reviewerId || !checkpointId) return console.log('Must specify reviewer id, and checkpoint id');

        $("#loader").show();

        contract.methods.giveReward(reviewerId, checkpointId).send({from: userAccount}).then(() => {
            $("#loader").hide();
            console.log('completed');
        });
    }
    
    $("#add-checkpoint").click(function() {
        var checkpointName = $("#checkpoint").val();
        addCheckpoint(checkpointName);
    });
    
    $("#view-game-checkpoints").click(function() {
        var gameAddress = $("#game").val();
        viewGameCheckpoints(gameAddress);
    });
    
    $("#view-progress").click(function() {
        var gameAddress = $("#game").val();
        var reviewerId = $("#reviewer").val();
        viewProgress(gameAddress, reviewerId);
    });

    $("#register-game").click(function() {
        var gameName = $("#checkpoint").val();
        registerGame(gameName);
    });
    
    $("#do-checkpoint").click(function() {
        var reviewerId = $("#reviewer").val();
        var checkpointId = $("#checkpoint").val();
        completeCheckpoint(reviewerId, checkpointId);
    });
}

$(document).ready(app);