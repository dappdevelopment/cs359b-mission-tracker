import React, { Component } from 'react';

import {withStyles} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

import GamePlayer from './GamePlayer';

const DEFAULT_SERVER_URL = 'https://35.231.137.35';

const styles = (theme) => ({
    root: {
        backgroundColor: theme.palette.common.white,
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
    button: {
        margin: theme.spacing.unit,
    },
    list: {
        width: '100%',
        maxWidth: 360,
        margin: 'auto',
    },
    spinner: {
        padding: '100px',
        width: '2em',
        margin: 'auto',
    }
});

class GameWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messageText: 'Use the arrow keys to move',
            userAccount: '',
            isCompleted: null,
        };
        this.gameServerUrl = DEFAULT_SERVER_URL;
    }

    componentDidMount() {
        window.web3 = new window.Web3(window.web3.currentProvider); // MetaMask injected Ethereum provider

        let accountsPromise = window.web3.eth.getAccounts(); // resolves on an array of accounts
    
        Promise.all([accountsPromise])
        .then((results) => {
            var accounts = results[0];
            this.setState({userAccount: accounts[0]});
            return accounts[0];
        })
        .then(account => {
            return fetch(`/missiontracker/api/get_progress/${account}`);
        })
        .then(response => response.json())
        .then(progress => {
            let rewardSet = new Set();
            if (progress['0x1CE1fa37c955F8f48cf5Cff659eb0885874BBa7b']){
                rewardSet = new Set(progress['0x1CE1fa37c955F8f48cf5Cff659eb0885874BBa7b'].progress.filter(({owned}) => owned).map(({name}) => name));
            }
            if (rewardSet.has("Champion's Hat")) {
                this.setState({isCompleted: true});
            }
            else {
                this.setState({isCompleted: false});
            }
        })
        .catch(console.error);
    }

    registerGameComplete() {
        if (this.state.messageText === 'Use the arrow keys to move') {
            this.setState({
                messageText: 'Registering checkpoint with blockchain...',
                isCompleted: true,
            })
            fetch(`${this.gameServerUrl}/missiontracker/api/give_reward/${this.state.userAccount}/3`, {mode: 'no-cors'})
            .then(response => {
                return response.json();
            })
            .then(receipt => {
                console.log(receipt);
                this.setState({
                    messageText: 'Checkpoint saved!',
                })
            })
        }
    }

    render() {
        let {classes} = this.props;
        let {messageText} = this.state;

        if (this.state.isCompleted === null) {
            return (
                <div className={classes.spinner}>
                    <CircularProgress />
                </div>
            );
        }

        return (
            <div className={classes.root}>
                <Typography className={classes.title}>
                    Square Mover
                </Typography>
                <GamePlayer isCompleted={this.state.isCompleted} onComplete={() => this.registerGameComplete()}/>
                {/* <Button onClick={() => this.registerGameComplete()}>WIN GAME!</Button> */}
                {/*<Button onClick={() => this.addCheckpointToGame()}>ADD CHECKPOINT -- DELETE THIS</Button>*/}
                <Typography>
                    {messageText}
                </Typography>
                <div>
                    <TextField label="Your Address" value={this.state.userAccount} className={classes.textField} onChange={(e) => this.setState({userAccount: e.target.value})}/>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(GameWindow);
