import React, { Component } from 'react';
import './App.css';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import ProgressViewer from './progress/ProgressViewer';
import GameWindow from './game/GameWindow';
import GameManager from './manage/GameManager';

const style = (theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
      },
});

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            viewing: 1,
        }
        this.reviewerId = Math.floor(Math.random() * 10000);
    }

    handleTabChange = (event, value) => {
        this.setState({
            viewing: value,
        })
    }

    render() {
        const {classes} = this.props;
        const {viewing} = this.state;
        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs value={viewing} onChange={this.handleTabChange} centered>
                        <Tab label="Play a Game" />
                        <Tab label="View Items" />
                        <Tab label="Manage Games" />
                    </Tabs>
                </AppBar>
                {viewing === 0 && <GameWindow />}
                {viewing === 1 && <ProgressViewer gameAddress={'0x1CE1fa37c955F8f48cf5Cff659eb0885874BBa7b'} />}
                {viewing === 2 && <GameManager />}
            </div>
        );
    }
}

export default withStyles(style)(App);
