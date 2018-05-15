import React, { Component } from 'react';
import './App.css';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import ProgressViewer from './progress/ProgressViewer';
import GameWindow from './game/GameWindow';

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
            viewing: 0
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
                    <Tabs value={viewing} onChange={this.handleTabChange}>
                        <Tab label="Play Game" />
                        <Tab label="View Progress" />
                    </Tabs>
                </AppBar>
                {viewing === 0 && <GameWindow reviewerId={this.reviewerId} />}
                {viewing === 1 && <ProgressViewer reviewerId={this.reviewerId} gameAddress={'0x1CE1fa37c955F8f48cf5Cff659eb0885874BBa7b'} />}
            </div>
        );
    }
}

export default withStyles(style)(App);
