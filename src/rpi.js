"use strict";

const LedMatrix  = require("node-rpi-rgb-led-matrix");
const Controller = require("./io/controller-driver");
const GameState  = require("./core/game-state");
const GameFacts  = require("./core/game-facts");
const Maybe      = require("data.maybe");

const availableControllers = Controller.list();

if (availableControllers.length < 2) {
    console.log("Please connect at least 2 controllers to play.");

    process.exit();
}

// Initializes the render function.
const render = require('./render')(new LedMatrix(
    GameFacts.singlePanelWidth, GameFacts.nbPanels
));

// Initializes controllers.
let controllers = availableControllers.map(Controller);

// Convenience exit function.
var exit = () => {
    controllers.forEach(Controller.close);

    process.exit();
};

// Whenever a player presses the SELECT button, we exit the program.
controllers.forEach(controller => {
    controller.on("keydown", (__, key) => {
        if (key === "SELECT") {
            exit();
        }
    })
});

/*
* The main loop function, that does the rendering
* and updates the game state regularly.
*/
const mainLoop = (gameState, previousGameState) => {
    render(gameState);

    // We make a new step only if th
    const newGameState = gameState.next(previousGameState, controllers);

    setTimeout(
        () => mainLoop(newGameState, gameState),
        GameFacts.pauseInterval
    );
};

// Starts running the game.
mainLoop(GameState.initial(controllers), Maybe.Nothing());
