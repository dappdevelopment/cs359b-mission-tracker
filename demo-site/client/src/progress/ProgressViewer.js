/**
 * View the items owned by users.
 */

import React, { Component } from 'react';

import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import SvgIcon from '@material-ui/core/SvgIcon';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = (theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        textAlign: 'center',
        flexGrow: 1,
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
    },
    listContainer: {
        marginLeft: '15%',
        marginRight: '15%',
        marginTop: '20px',
        marginBottom: '20px',
    },
    list: {
        width: '100%',
        margin: 'auto',
    },
    ul: {
        padding: 0,
    },
    subheader: {
        textAlign: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    gameName: {
        fontSize: '1.5em',
    },
    ownedItem: {
        color: 'green',
        fontSize: '1.25em',
    },
    unownedItem: {
        color: 'gray',
        fontSize: '1.25em',
    },
    credits: {
        fontSize: '0.5em',
    },
});

class ProgressViewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayProgress: null,
            playerFieldText: props.reviewerId,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.playerFieldText !== this.state.playerFieldText) {
            this.getProgress();
        }
    }

    getProgress() {
        this.setState({
            displayProgress: 'loading',
        })
        fetch(`/missiontracker/api/get_progress/${this.state.playerFieldText}`)
        .then(response => response.json())
        .then(progress => {
            console.log(progress);
            this.setState({
                displayProgress: progress,
            })
        })
        .catch((error) => console.error);
    }

    render() {
        let {classes, reviewerId} = this.props;
        let {displayProgress} = this.state;

        let progressList = null;
        if (displayProgress === 'loading') {
            progressList = (
                <CircularProgress />
            )
        }
        else if (displayProgress) {
            let progressComponents = Object.entries(displayProgress).map(([gameAddress, {progress, gameName}], i) => {
                return (
                    <li key={`section-${i}`}>
                        <ul className={classes.ul}>
                            <ListSubheader className={classes.subheader}>
                                <span className={classes.gameName}>{`${gameName} `}</span>
                                <span>{` (${gameAddress})`}</span>
                            </ListSubheader>
                            {progress.map(({name, owned}) => (
                                <ListItem key={name}>
                                    {owned ? 
                                    <SvgIcon style={{color: 'yellow', width: 150, height: 100}}>
                                        <path style={{transform: 'scale(0.75)'}} d="M24.791,4.451c0.02-0.948-0.016-1.547-0.016-1.547l-9.264-0.007l0,0h-0.047h-0.047l0,0L6.152,2.904
            c0,0-0.035,0.599-0.015,1.547H0v1.012c0,0.231,0.039,5.68,3.402,8.665C4.805,15.373,6.555,15.999,8.618,16
            c0.312,0,0.633-0.021,0.958-0.049c1.172,1.605,2.526,2.729,4.049,3.289v4.445H9.154v2.784H7.677v1.561h7.74h0.094h7.74V26.47
            h-1.478v-2.784h-4.471v-4.445c1.522-0.56,2.877-1.684,4.049-3.289C21.678,15.98,21.999,16,22.311,16
            c2.062-0.002,3.812-0.627,5.215-1.873c3.363-2.985,3.402-8.434,3.402-8.665V4.451H24.791z M4.752,12.619
            c-1.921-1.7-2.489-4.61-2.657-6.144h4.158c0.176,1.911,0.59,4.292,1.545,6.385c0.175,0.384,0.359,0.748,0.547,1.104
            C6.912,13.909,5.706,13.462,4.752,12.619z M26.176,12.619c-0.953,0.844-2.16,1.29-3.592,1.345c0.188-0.355,0.372-0.72,0.547-1.104
            c0.955-2.093,1.369-4.474,1.544-6.385h4.158C28.665,8.008,28.098,10.918,26.176,12.619z"/>
                                    </SvgIcon>
                                    :
                                    <SvgIcon style={{ width: 150, height: 100}} color="disabled">
                                    <path style={{transform: 'scale(0.05) translate(125px, 125px)'}} d="M0,170l65.555-65.555L0,38.891L38.891,0l65.555,65.555L170,0l38.891,38.891l-65.555,65.555L208.891,170L170,208.891
l-65.555-65.555l-65.555,65.555L0,170z"/>
                                    </SvgIcon>}
                                    <ListItemText
                                        disableTypography
                                        primary={<Typography className={owned ? classes.ownedItem : classes.unownedItem}>{name}</Typography>}/>
                                </ListItem>
                            ))}
                        </ul>
                    </li>
                );
            });
            if (progressComponents.length > 0) {
                progressList = (
                    <div>
                    <Paper className={classes.listContainer}>
                        <List className={classes.list} subheader={<li />}>
                            {progressComponents}
                        </List>
                        </Paper>
                <div className={classes.credits}>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
                </div>
                )
            }
            else {
                progressList = (
                    <Typography>
                        You have no items!
                    </Typography>
                )
            }
        }

        return (
            <div className={classes.root}>
                <Typography className={classes.title}>
                    Inventory
                </Typography>
                <div>
                    <TextField label = {'View an inventory'} placeholder={'Address'} className={classes.textField} onChange={(e) => this.setState({playerFieldText: e.target.value})}/>
                </div>
                {progressList}
            </div>
        );
    }
}

export default withStyles(styles)(ProgressViewer);
