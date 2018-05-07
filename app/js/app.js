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

        contract.methods.addGameCheckpoint(checkpointName).send({from: userAccount})
            .then((receipt) => {
                contract.methods.getGameCheckpointCount(userAccount).call().then(
                    (count) => {
                        console.log('added');
                        $("#loader").hide();
                    }
                )
            });
    }

    function viewGameCheckpoints(gameAddress) {
        if (!gameAddress) return console.log('Must specify a game');

        $("#loader").show();

        contract.methods.getGameCheckpointCount(gameAddress).call().then(
            (count) => {
                let funcs = [];
                let checkpointNames = [];
                for (let i = 0; i < count; i++) {
                    funcs.push(() => {
                        return contract.methods.getGameCheckpointName(gameAddress, i).call()
                        .then((name) => checkpointNames.push(name));
                    });
                }
                funcs.reduce((prev, curr) => {
                    return prev.then(curr);
                }, Promise.resolve()).then(
                    () => {
                        console.log(checkpointNames);
                        $("#loader").hide();
                    }
                )
            }
        )
    }

    function viewProgress(gameAddress, reviewerId) {
        if (!gameAddress || !reviewerId) return console.log('Must specify a game and reviewer id');

        $("#loader").show();

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
                        console.log(checkpointNames);
                        console.log(checkpointComplete);
                        $("#loader").hide();
                    }
                )
            }
        )
    }

    function completeCheckpoint(reviewerId, checkpointId) {
        if (!reviewerId || !checkpointId) return console.log('Must specify reviewer id, and checkpoint id');

        $("#loader").show();

        contract.methods.setCheckpointComplete(reviewerId, checkpointId).send({from: userAccount}).then(() => {
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
    
    $("#do-checkpoint").click(function() {
        var reviewerId = $("#reviewer").val();
        var checkpointId = $("#checkpoint").val();
        completeCheckpoint(reviewerId, checkpointId);
    });
}

$(document).ready(app);