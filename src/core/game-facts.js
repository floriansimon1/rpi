"use strict";

// Note: the following code assumes even RGB panel dimensions.

let GameFacts = {
    /**************/
    /* DIMENSIONS */
    /**************/
    lowestY: 0,
    lowestX: 0,

    width:  64,
    height: 32,

    ballWidth:          2,
    ballHeight:         2,
    middleCircleRadius: 5,
    racketHeight:       10,

    leftScoreXCenterDistance: -10,
    rightScoreXCenterDistance: 7,

    victoryScoreY: 4,
    gameScoreY:    2,

    playerCollisionZoneWidth: 3,

    /*********************/
    /* VELOCITIES (px/s) */
    /*********************/
    maxBallSpeed:         250,
    initialBallSpeed:     50,
    racketSpeed:          72,
    bounceSpeedIncrement: 10,

    /************/
    /* GRAPHICS */
    /************/
    fieldColor:       { r: 255, g: 255, b: 255 },
    player1Color:     { r: 0,   g: 0,   b: 255 },
    ballInitialColor: { r: 255, g: 255, b: 0 },
    player2Color:     { r: 255, g: 0,   b: 0 },

    colorsByLetter: {
        X: { r: 255, g: 150, b: 150 },
        O: { r: 255, g:   0, b:   0 },
        K: { r:  68, g:  21, b:   0 }
    },

    /***********/
    /* PROGRAM */
    /***********/
    pauseInterval: 5,

    /**************/
    /* RGB panels */
    /**************/
    singlePanelWidth: 32,
    nbPanels:         2
};

/************************/
/* CALCULATED CONSTANTS */
/************************/
GameFacts.centeredRacketPosition = (GameFacts.height - GameFacts.racketHeight) / 2;
GameFacts.ballCenterY            = (GameFacts.height - GameFacts.ballHeight) / 2;
GameFacts.ballCenterX            = (GameFacts.width - GameFacts.ballWidth) / 2;
GameFacts.highestY               = GameFacts.height - GameFacts.lowestY - 1;
GameFacts.highestX               = GameFacts.width - GameFacts.lowestX - 1;
GameFacts.leftMiddleLineX        = GameFacts.width / 2 - 1;
GameFacts.yCenter                = GameFacts.height / 2;
GameFacts.rightMiddleLineX       = GameFacts.width / 2;
GameFacts.xCenter                = GameFacts.width / 2;

GameFacts.racketMaxPosition = GameFacts.highestY - GameFacts.racketHeight + 1;
GameFacts.rightRacketX      = GameFacts.highestX - 1
GameFacts.leftRacketX       = GameFacts.lowestX + 1;

GameFacts.ballColorGreenDecrease = Math.round(
    GameFacts.ballInitialColor.g
    * GameFacts.bounceSpeedIncrement
    / (GameFacts.maxBallSpeed - GameFacts.initialBallSpeed)
);

module.exports = GameFacts;
