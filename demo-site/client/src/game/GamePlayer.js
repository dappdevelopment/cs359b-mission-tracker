import React, { Component } from 'react';

import {withStyles} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import List, {ListItem, ListItemText, ListItemIcon} from 'material-ui/List';

import CheckIcon from '@material-ui/icons/Check';
import NotInterestedIcon from '@material-ui/icons/NotInterested';

const styles = (theme) => ({
    game: {
        backgroundColor: 'gray',
    },
    ball: {
        fill: 'blue',
    }
});

const canvasHeight = 320;
const canvasWidth = 480;
const ballSpeed = 5;

class GamePlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 10,
            y: canvasHeight / 2,
        }
        this.interval = null;
    }

    componentWillMount() {
        document.addEventListener("keydown", (e) => this.keyDownHandler(e), false);
        document.addEventListener("keyup", (e) => this.keyUpHandler(e), false);
    }

    moveRight() {
        let {x} = this.state;
        this.setState({
            x: x+ballSpeed,
        });
        if (x > canvasWidth) {
            this.props.onComplete();
        }
    }

    moveLeft() {
        let {x} = this.state;
        this.setState({
            x: x-ballSpeed,
        })
    }

    keyDownHandler(e) {
        if (this.interval) {
            clearInterval(this.interval);
        }
        if(e.keyCode == 39) {
            this.interval = setInterval(() => this.moveRight(), 30);
        }
        else if(e.keyCode == 37) {
            this.interval = setInterval(() => this.moveLeft(), 30);
        }
    }
    
    keyUpHandler(e) {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    render() {
        let {classes} = this.props;
        let {x, y} = this.state;

        return (
            <svg width={canvasWidth} height={canvasHeight} className={classes.game}>
                <rect width="20" height="20" x={x} y={y} className={classes.ball} />
            </svg>
        );
    }
}

export default withStyles(styles)(GamePlayer);
