import React, { Component } from 'react';
import './App.css';

import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';

import ProgressViewer from './progress/ProgressViewer';

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
                {viewing === 0 && <div />}
                {viewing === 1 && <ProgressViewer />}
            </div>
        );
    }
}

export default withStyles(style)(App);
