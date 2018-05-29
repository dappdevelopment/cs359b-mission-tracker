import React, { Component } from 'react';

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

class ProgressViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayProgress: null,
        };
        this.reviewerFieldText = props.reviewerId;
        this.gameFieldText = props.gameAddress;
    }

    getProgress() {
        fetch(`/missiontracker/api/get_progress/${this.gameFieldText}/${this.reviewerFieldText}`)
        .then(response => response.json())
        .then(progress => {
            console.log(progress);
            this.setState({
                displayProgress: progress,
            })
        })
    }

    render() {
        let {classes, reviewerId, gameAddress} = this.props;
        let {displayProgress} = this.state;

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
                    <TextField label="Player ID" defaultValue={reviewerId} className={classes.textField} onChange={(e) => this.reviewerFieldText = e.target.value}/>
                </div>
                <div>
                    <TextField label="Game ID" defaultValue={gameAddress} className={classes.textField} onChange={(e) => this.gameFieldText = e.target.value}/>
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

export default withStyles(styles)(ProgressViewer);
