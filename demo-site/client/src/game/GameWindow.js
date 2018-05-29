import React, { Component } from 'react';

import {withStyles} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import List, {ListItem, ListItemText, ListItemIcon} from 'material-ui/List';

import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

import GamePlayer from './GamePlayer';

const DEFAULT_SERVER_URL = 'https://35.231.137.35';

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

class GameWindow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messageText: 'Use the arrow keys to move',
        };
        this.gameServerUrl = DEFAULT_SERVER_URL;
    }

    registerGameComplete() {
        if (this.state.messageText === 'Use the arrow keys to move') {
            this.setState({
                messageText: 'Registering checkpoint with blockchain...',
            })
            fetch(`${this.gameServerUrl}/missiontracker/api/complete_checkpoint/${this.props.reviewerId}/0`, {mode: 'no-cors'})
            .then(response => {
                console.log(response);
                response.json()
            })
            .then(receipt => {
                console.log(receipt);
                this.setState({
                    messageText: 'Checkpoint saved!',
                })
            })
        }
    }

    addCheckpointToGame() {
        fetch(`${this.gameServerUrl}/missiontracker/api/add_checkpoint/${encodeURIComponent('Game complete!')}`)
    }

    render() {
        let {classes} = this.props;
        let {messageText} = this.state;

        return (
            <div className={classes.root}>
                <Typography variant="headline">
                    Get to the other side!
                </Typography>
                <Typography>
                    Your player ID is {this.props.reviewerId}
                </Typography>
                <GamePlayer onComplete={() => this.registerGameComplete()}/>
                {/* <Button onClick={() => this.registerGameComplete()}>WIN GAME!</Button> */}
                {/*<Button onClick={() => this.addCheckpointToGame()}>ADD CHECKPOINT -- DELETE THIS</Button>*/}
                <Typography>
                    {messageText}
                </Typography>
                <div>
                    <TextField label="Game Server URL" defaultValue={DEFAULT_SERVER_URL} className={classes.textField} onChange={(e) => this.gameServerUrl = e.target.value}/>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(GameWindow);
