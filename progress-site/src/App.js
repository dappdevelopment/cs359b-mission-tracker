import React, { Component } from 'react';
import MissionTrackerJson from './contracts/MissionTracker.json'
import logo from './logo.svg';
import './App.css';

import {withStyles} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import List, {ListItem, ListItemText, ListItemIcon} from 'material-ui/List';

import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

const styles = (theme) => ({
    root: {
        backgroundColor: theme.palette.common.white,
        textAlign: 'center',
    },
    textField: {
        margin: theme.spacing.unit,
    },
    button: {
        margin: theme.spacing.unit,
    },
    list: {
        width: '100%',
        maxWidth: 360,
        margin: 'auto',
    },
});

class App extends Component {
    constructor(props) {
        super(props);
        let web3 = window.web3;
        this.state = {
            userAccount: null,
            contract: null,
            displayProgress: null,
        };
        this.reviewerFieldText = null;
        this.gameFieldText = null;
        if (typeof web3 === 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
        web3 = new window.Web3(window.web3.currentProvider); // MetaMask injected Ethereum provider
        console.log("Using web3 version: " + window.Web3.version);
    
        let contractDataPromise = MissionTrackerJson;
        let networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
        let accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
    
        Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
        .then((results) => {
            let contractData = results[0];
            let networkId = results[1];
            let accounts = results[2];
            let userAccount = accounts[0];
    
            // Make sure the contract is deployed on the connected network
            if (!(networkId in contractData.networks)) {
                throw new Error("Contract not found in selected Ethereum network on MetaMask.");
            }
    
            let contractAddress = contractData.networks[networkId].address;
            let contract = new web3.eth.Contract(contractData.abi, contractAddress);
            return {userAccount, contract};
        })
        .then(({userAccount, contract}) => this.setState({userAccount, contract}))
        .catch(console.error);
    }

    getProgress() {
        let gameAddress = this.gameFieldText;
        let reviewerId = this.reviewerFieldText;
        if (!gameAddress || !reviewerId) return console.log('Must specify a game and reviewer id');

        let {contract} = this.state;

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
                        this.setState({
                            displayProgress: checkpointNames.map((name, i) => ({
                                name, 
                                completed: checkpointComplete[i],
                            }))
                        })
                    }
                )
            }
        )
    }

    render() {
        let {classes} = this.props;
        let {userAccount, contract, displayProgress} = this.state;
        if (!userAccount || !contract) {
            return (
                <Typography align="center" variant="headline">
                    Please wait...
                </Typography>
            )
        }
        let progressList = null;
        if (displayProgress) {
            let progressComponents = displayProgress.map(({name, completed}) => {
                console.log(name, completed);
                return (
                    <ListItem key={name}>
                        <ListItemIcon>
                            {completed ? <CheckIcon /> : <NotInterestedIcon />}
                        </ListItemIcon>
                        <ListItemText primary={name} />
                    </ListItem>
                )
            })
            progressList = (
                <List className={classes.list}>
                    {progressComponents}
                </List>
            )
        }
        return (
            <div className={classes.root}>
                <Typography variant="headline">
                    Mission Tracker
                </Typography>
                <div>
                    <TextField label="Reviewer ID" className={classes.textField} onChange={(e) => this.reviewerFieldText = e.target.value}/>
                </div>
                <div>
                    <TextField label="Game ID" className={classes.textField} onChange={(e) => this.gameFieldText = e.target.value}/>
                </div>
                <div>
                    <Button variant="raised" className={classes.button} onClick={() => this.getProgress()}>
                        View Progress
                    </Button>
                </div>
                {progressList}
            </div>
        );
    }
}

export default withStyles(styles)(App);
