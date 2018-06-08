import React, { Component } from 'react';

import MissionTrackerJSON from '../contracts/MissionTracker.json';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';
import SvgIcon from '@material-ui/core/SvgIcon';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
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
});

class GameManager extends Component {
    constructor(props, context) {
        super(props);
        this.state = {
            nameFieldText: '',
            achievementFieldText: '',
            showSnackbar: false,
            snackbarText: '',
        };
        this.contract = null;
        this.userAccount = null;

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
                throw new Error("Contract not found in selected Ethereum network on MetaMask.");
            }
    
            var contractAddress = contractData.networks[networkId].address;
            this.contract = new window.web3.eth.Contract(contractData.abi, contractAddress);
        })
        .catch(console.error);
    }

    registerGame() {
        let {nameFieldText} = this.state;
        
        this.contract.methods.registerGame(nameFieldText).send({from: this.userAccount})
        .then((receipt) => {
            console.log(receipt);
        });
    }

    addAchievement() {
        let {achievementFieldText} = this.state;

        this.contract.methods.createAndAllowReward(achievementFieldText).send({from: this.userAccount})
        .then((receipt) => {
            console.log(receipt);
        });
    }

    handleClose = (event, reason) => {
      this.setState({ showSnackbar: false });
    };

    render() {
        let {classes} = this.props;

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
                    <Button className={classes.button} onClick={() => {this.addAchievement(); this.setState({showSnackbar: true, snackbarText: 'New item (#5) forged!'});}}>CREATE</Button>
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