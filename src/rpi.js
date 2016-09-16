"use strict";

const LedMatrix  = require("node-rpi-rgb-led-matrix");
const GameState  = require("./core/game-state");
const GameFacts  = require("./core/game-facts");
const Controller = require("dragonfly-snes");
const Maybe      = require("data.maybe");
const bmp        = require("pixel-bmp");
const _          = require("lodash");

const availableControllers = Controller.list();

if (availableControllers.length < 2) {
    console.log("Please connect at least 2 controllers to play.");

    process.exit();
}

// Initializes the LED matrix.
let matrix = new LedMatrix(
    GameFacts.singlePanelWidth, GameFacts.nbPanels
);

// Initializes the render function.
const render = require("./graphics/render")(matrix);

// Initializes controllers.
let controllers = availableControllers.map(Controller);

// Convenience exit function.
var exit = () => {
    controllers.forEach(Controller.close);

    process.exit();
};

// Whenever a player presses the SELECT button, we exit the program.
controllers.forEach(controller => {
    controller.on("keydown", key => {
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
    render(gameState, previousGameState);

    setTimeout(
        () => mainLoop(gameState.next(previousGameState, controllers), Maybe.of(gameState)),
        GameFacts.pauseInterval
    );
};

// Loads the splash screen.
bmp
.parse(`${__dirname}/assets/splash.bmp`)
.then(_.head)
.then(image => {
    _.range(image.width).forEach(x => {
        _.range(image.height).forEach(y => {
            const pixelNo = y * image.width + x;

            matrix.setPixel(
                x,
                y,
                image.data[pixelNo * 4],
                image.data[pixelNo * 4 + 1],
                image.data[pixelNo * 4 + 2]
            );
        });
    });

    // After the splash logo has been seen, start the game
    setTimeout(() => mainLoop(GameState.initial(controllers), Maybe.Nothing()), 4000);
})
