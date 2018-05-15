import React, { Component } from 'react';

import {withStyles} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import List, {ListItem, ListItemText, ListItemIcon} from 'material-ui/List';

import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

import GamePlayer from './GamePlayer';

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
    }

    registerGameComplete() {
        if (this.state.messageText === 'Use the arrow keys to move') {
            this.setState({
                messageText: 'Registering checkpoint with blockchain...',
            })
            fetch(`/api/complete_checkpoint/${this.props.reviewerId}/0`)
            .then(response => response.json())
            .then(receipt => {
                console.log(receipt);
                this.setState({
                    messageText: 'Checkpoint saved!',
                })
            })
        }
    }

    addCheckpointToGame() {
        fetch(`/api/add_checkpoint/${encodeURIComponent('Game complete!')}`)
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
            </div>
        );
    }
}

export default withStyles(styles)(GameWindow);
