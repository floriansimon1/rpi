"use strict";

const Ball             = require("./ball");
const Player           = require("./player");
const Immutable        = require("immutable");
const Maybe            = require("data.maybe");
const Collisions       = require("./collisions");
const clamp            = require("../utils/clamp");
const methodify        = require("../utils/methodify");
const valueOnCondition = require("../utils/value-on-condition");

// In nanoseconds.
const getElapsedTime = () => process.hrtime()[1];

let GameState = Immutable.Record({
    /*
    * Game models.
    *
    * Note for "players": its indexing follows
    * the controllers' intentionally.
    */
    players: null,
    ball:    new Ball(),

    // In process.hrtime() format.
    currentTime: getElapsedTime(),

    // Player index of the winner, if any.
    victoryDetails: Maybe.Nothing()
});

// Returns a new instance of an initial game state.
GameState.initial = () => new GameState({
    players: new Immutable.List([new Player(), new Player()]),
    ball:    Ball.initial(),

    // In nanoseconds.
    currentTime: getElapsedTime(),
});

// "playerIndex" is the player index in the players array.
const incrementScore = (gameState, playerIndex) => {
    const player = gameState.players[playerIndex];

    const newScore = player.score + 1;

    return gameState
    .set("players", (
        gameState.players.set(playerIndex, (
            player.set("score", newScore)
        ))
    ))
    .set("wonBy", (
        newScore === 10
        ? Maybe.of(playerIndex)
        : gameState.wonBy
    ));
};

// Computes the new game state.
GameState.next = (gameState, previousGameState, controllers) => {
    // Waits for a START button press to start a new game.
    if (gameState.victoryDetails.isJust) {
        if (controllers.find(controller => controller.keysPressed.START)) {
            return gameState.initial();
        } else {
            return gameState;
        }
    }

    // Moves players and the ball.
    return gameState.withMutations(gameState => {
        const oldTime = gameState.currentTime;
        const newTime = getElapsedTime();

        gameState.currentTime = newTime;

        // Time elapsed since last frame.
        const Δs = (newTime - oldTime) / Math.pow(10, 6);

        // Ball movement.
        gameState.ball = gameState.ball.move(Δs);

        // Player movement.
        gameState.players = new Immutable.List(
            _
            .zip(gameState.players, controllers)
            .map(_.spread((player, controller) => player.move(Δs, controller)))
        );

        // Collision detection occurs only if there has already been movement.
        previousGameState
        .chain(previousGameState => valueOnCondition(
            previousGameState, previousGameState.victoryDetails.isNothing
        ))
        .map(previousGameState => {
            const collision = Collisions.detectBallCollisions(gameState, previousGameState);

            // Applies collision effects.
            collision.map(collision => {
                /*
                * Should happen first so that if a player scores,
                * we don't alter the coordinates of the reinit'd
                * ball.
                */
                collision.vertical.map(side => {
                    gameState.ball = gameState.ball.set('angle', gameState.ball.oppositeAngle);
                });

                collision.horizontal.map(side => {
                    if (collision.player.isNothing) {
                        gameState.ball = Ball.initial({
                            xDirection: gameState.ball.oppositeXDirection()
                        });

                        incrementScore(gameState, side === Directions.LEFT ? 1 : 0);
                    }
                });

                collision.player.map(playerIndex => {
                    // Increases the ball speed.
                    gameState.ball = gameState.ball.set("speed", clamp(
                        0,
                        GameFacts.maxBallSpeed,
                        gameState.ball.speed + GameFacts.bounceSpeedIncrement
                    ));

                    // Goes back where it came from.
                    collision
                    .vertical
                    .map(() => {
                        gameState.ball = gameState.ball.set("xDirection", (
                            gameState.ball.oppositeXDirection()
                        ));
                    })

                    // Mirror bounce.
                    .orElse(() => {
                        const racketLine = Collisions.yRacketLine(
                            gameState, previousGameState, playerIndex
                        );

                        const racketPercent = (
                            (ball.y - racketLine.lo) /
                            (racketLine.hi - racketLine.lo)
                        );

                        gameState.ball = gameState.ball.set("angle", clamp(
                            GameFacts.minAngle,
                            GameFacts.maxAngle,
                            racketPercent * Math.PI * 2
                        ));
                    });
                });
            });
        });
    });
};

methodify(GameState, ["next"]);

module.exports = GameState;
