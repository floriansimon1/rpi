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
    racketSize:         6,
    middleCircleRadius: 5,

    victoryScoreY: 4,
    gameScoreY:    2,

    playerCollisionZoneWidth: 3,

    minAngle: 0.15 * Math.PI * 2,
    maxAngle: 0.85 * Math.PI * 2,

    /*********************/
    /* VELOCITIES (px/s) */
    /*********************/
    racketSpeed:          4,
    initialBallSpeed:     4,
    bounceSpeedIncrement: 0.2,

    /************/
    /* GRAPHICS */
    /************/
    fieldColor:   { r: 255, g: 255, b: 255 },
    player1Color: { r: 0,   g: 0,   b: 255 },
    ballColor:    { r: 255, g: 255, b: 0 },
    player2Color: { r: 255, g: 0,   b: 0 },

    colorsByLetter: {
        X: { r: 255, g: 150, b: 150 },
        O: { r: 255, g:   0, b:   0 },
        K: { r:  68, g:  21, b:   0 }
    },

    /***********/
    /* PROGRAM */
    /***********/
    pauseInterval: 10,

    /**************/
    /* RGB panels */
    /**************/
    singlePanelWidth: 32,
    nbPanels:         2
};

/*************************/
/* CALCULATED DIMENSIONS */
/*************************/
GameFacts.centeredRacketPosition = (GameFacts.height - GameFacts.racketSize) / 2;
GameFacts.highestY               = GameFacts.height - GameFacts.lowestY - 1;
GameFacts.highestX               = GameFacts.width - GameFacts.lowestX - 1;
GameFacts.ballCenterY            = GameFacts.height / 2 - 1;
GameFacts.leftMiddleLineX        = GameFacts.width / 2 - 1;
GameFacts.ballCenterX            = GameFacts.width / 2 - 1;
GameFacts.yCenter                = GameFacts.heigth / 2;
GameFacts.rightMiddleLineX       = GameFacts.width / 2;
GameFacts.xCenter                = GameFacts.width / 2;

GameFacts.racketMaxPosition = GameFacts.highestY - GameFacts.racketSize;
GameFacts.rightRacketX      = GameFacts.highestX - 1
GameFacts.leftRacketX       = GameFacts.lowestX + 1;

module.exports = GameFacts;
