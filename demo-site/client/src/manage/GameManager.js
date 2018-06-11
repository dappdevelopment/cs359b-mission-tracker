/**
 * Handles the registering of new games and the creation of new reward types.
 */

import React, { Component } from 'react';

import MissionTrackerJSON from '../contracts/MissionTracker.json';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const styles = (theme) => ({
    root: {
        marginLeft: '10%',
        marginRight: '10%',
        textAlign: 'center',
    },
    title: {
        padding: theme.spacing.unit * 5,
        fontSize: '4em',
        color: '#848484',
    },
    textField: {
        margin: theme.spacing.unit,
    },
    select: {
        minWidth: 120,
    },
    button: {
        margin: theme.spacing.unit,
        width: 160,
    },
    heading: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
    spinner: {
        padding: '100px',
        width: '2em',
        margin: 'auto',
    }
});

class GameManager extends Component {
    
    constructor(props, context) {
        super(props);
        this.state = {
            nameFieldText: '',
            achievementFieldText: '',
            showSnackbar: false,
            snackbarText: '',
            loading: false,
            failed: false,
            wrongNetwork: false,
        };
        this.rewardId = null;
        this.contract = null;
        this.userAccount = null;

        if (typeof web3 == 'undefined') {
            this.state.failed = true;
        }
        else {
            // Connect to Metamask and find the contract
            window.web3 = new window.Web3(window.web3.currentProvider); // MetaMask injected Ethereum provider
    
            let networkIdPromise = window.web3.eth.net.getId(); // resolves on the current network id
            let accountsPromise = window.web3.eth.getAccounts(); // resolves on an array of accounts
        
            Promise.all([MissionTrackerJSON, networkIdPromise, accountsPromise])
            .then((results) => {
                var contractData = results[0];
                var networkId = results[1];
                var accounts = results[2];
                this.userAccount = accounts[0];
        
                // Make sure the contract is deployed on the connected network
                if (!(networkId in contractData.networks)) {
                    this.setState({
                        wrongNetwork: true,
                    })
                    // throw new Error("Contract not found in selected Ethereum network on MetaMask.");
                }
                else{
                    var contractAddress = contractData.networks[networkId].address;
                    this.contract = new window.web3.eth.Contract(contractData.abi, contractAddress);
                }
            })
            .catch(() => {
                this.setState({
                    failed: true,
                })
            });
        }
    }

    /**
     * Associates a new string name with the user's wallet on the smart contract.
     */
    registerGame() {
        let {nameFieldText} = this.state;
        
        this.contract.methods.registerGame(nameFieldText).send({from: this.userAccount})
        .then((receipt) => {
            console.log(receipt);
        });
    }

    /**
     * Creates a new reward type on the smart contract that the user can give to players.
     */
    addReward() {
        let {achievementFieldText} = this.state;

        this.setState({loading: true})
        this.contract.methods.createAndAllowReward(achievementFieldText).send({from: this.userAccount})
        .then((receipt) => {
            console.log(receipt);
            return fetch(`/missiontracker/api/get_reward_id/${this.userAccount}`);
        })
        .then((response) => response.json())
        .then((rewardId) => {
            console.log(rewardId);
            this.setState({
                loading: false,
                showSnackbar: true,
                snackbarText: `New item (#${rewardId}) forged!`
            })
        });
    }

    handleClose = (event, reason) => {
      this.setState({ showSnackbar: false });
    };

    render() {
        let {classes} = this.props;

        if (this.state.failed || this.state.wrongNetwork) {
            return (
                <div className={classes.root}>
                    <Typography className={classes.title}>
                        Inventory
                    </Typography>
                    <Typography>
                        {this.state.failed ? 'Please install Metamask to manage your games.' : 'Please connect to Rinkeby Test Network.'}
                    </Typography>
                </div>
            )
        }
        else if (this.state.loading) {
            return (
                <div className={classes.root}>
                    <Typography className={classes.title}>
                        Inventory
                    </Typography>
                    <div className={classes.spinner}>
                        <CircularProgress />
                    </div>
                </div>
            )
        }
        return (
            <div className={classes.root}>
                <Typography className={classes.title}>
                    Inventory
                </Typography>
                <div>
                    <TextField placeholder={'Game Name'} className={classes.textField} onChange={(e) => this.setState({nameFieldText: e.target.value})}/>
                    <Button className={classes.button} onClick={() => {this.registerGame(); this.setState({showSnackbar: true, snackbarText: 'New game registered!'});}}>REGISTER</Button>
                </div>
                <div>
                    <TextField placeholder={'New Item Name'} className={classes.textField} onChange={(e) => this.setState({achievementFieldText: e.target.value})}/>
                    <Button className={classes.button} onClick={() => {this.addReward();}}>CREATE</Button>
                </div>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    open={this.state.showSnackbar}
                    autoHideDuration={4000}
                    onClose={this.handleClose}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.state.snackbarText}</span>}
                    />
            </div>
        );
    }
}

export default withStyles(styles)(GameManager);
