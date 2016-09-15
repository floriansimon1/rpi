"use strict";

const _                = require("lodash");
const Ball             = require("./ball");
const Player           = require("./player");
const Immutable        = require("immutable");
const Maybe            = require("data.maybe");
const Collisions       = require("./collisions");
const Directions       = require("./directions");
const GameFacts        = require("./game-facts");
const clamp            = require("../utils/clamp");
const between          = require("../utils/between");
const methodify        = require("../utils/methodify");
const valueOnCondition = require("../utils/value-on-condition");

const pauseEnded    = Symbol();
const holdingStart  = Symbol();
const startReleased = Symbol();

// In nanoseconds.
const getElapsedTimeSince = point => {
    const [s, ns] = process.hrtime(point);

    return s + ns * Math.pow(10, -9);
};

let GameState = Immutable.Record({
    pauseState: Maybe.Just(startReleased),

    pauseStates: { pauseEnded, holdingStart, startReleased },

    /*
    * Game models.
    *
    * Note for "players": its indexing follows
    * the controllers' intentionally.
    */
    players: null,
    ball:    Ball.initial(),

    // See NodeJS' doc for process.hrtime for info about the type of this.
    currentTime: process.hrtime(),

    // Player index of the winner, if any.
    victoryDetails: Maybe.Nothing()
});

// Returns a new instance of an initial game state.
GameState.initial = () => new GameState({
    players:     new Immutable.List([new Player(), new Player()]),
    currentTime: process.hrtime(),
    ball:        Ball.initial()
});

// "playerIndex" is the player index in the players array.
const incrementScore = (gameState, playerIndex) => {
    const player = gameState.players.get(playerIndex);

    const newScore = player.score + 1;

    return gameState
    .set("players", (
        gameState.players.set(playerIndex, (
            player.set("score", newScore)
        ))
    ))
    .set("victoryDetails", (
        newScore === 10
        ? Maybe.of({ winnerIndex: playerIndex })
        : gameState.victoryDetails
    ));
};

// Computes the new game state.
GameState.next = (gameState, previousGameState, controllers) => {
    const startPressed = controllers.find(controller => controller.keysPressed.START);

    // Waits for a START button press to start a new game.
    if (gameState.victoryDetails.isJust) {
        if (startPressed) {
            return GameState.initial().set("pauseState", Maybe.Just(holdingStart));
        } else {
            return gameState;
        }
    }

    // Moves players and the ball.
    return gameState.withMutations(gameState => {
        // Approximate time elapsed since last frame.
        const Δs = getElapsedTimeSince(gameState.currentTime);

        // Relative to fixed arbitrary time point for the whole program.
        gameState.currentTime = process.hrtime();

        if (gameState.pauseState.getOrElse(pauseEnded) !== pauseEnded) {
            if (gameState.pauseState.get() === holdingStart && !startPressed) {
                gameState.pauseState = Maybe.Just(startReleased);
            } else if (gameState.pauseState.get() === startReleased && startPressed) {
                gameState.pauseState = Maybe.Just(pauseEnded);
            }

            return;
        } else if (startPressed) {
            if (gameState.pauseState.isNothing) {
                gameState.pauseState = Maybe.Just(holdingStart);
            }

            return;
        } else {
            gameState.pauseState = Maybe.Nothing();
        }

        const oldPosition = {
            x: Math.round(gameState.ball.x),
            y: Math.round(gameState.ball.y)
        };

        // Ball movement.
        gameState.ball = gameState.ball.move(Δs);

        if (
            Math.round(gameState.ball.x) !== oldPosition.x
            || Math.round(gameState.ball.y) !== oldPosition.y
        ) {
            gameState.ball = gameState.ball.set("previousDifferentPosition", oldPosition);
        }

        // Player movement.
        gameState.players = new Immutable.List(
            _
            .zip(gameState.players.toArray(), controllers)
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
                collision.vertical.map(() => {
                    gameState.ball = gameState.ball.bounceVertically();
                });

                collision.horizontal.map(side => {
                    if (collision.player.isNothing) {
                        gameState.ball = Ball.initial();

                        incrementScore(gameState, side === Directions.LEFT ? 1 : 0);
                    }
                });

                collision.player.map(playerIndex => {
                    // Increases the ball speed.
                    gameState.ball = gameState.ball.accelerate();

                    // Goes back where it came from.
                    collision
                    .vertical
                    .map(() => {
                        gameState.ball = gameState.ball.oppositeDirection();
                    })

                    // Mirror bounce.
                    .orElse(() => {
                        // Base bounce in any case.
                        gameState.ball = gameState.ball.bounceHorizontally();

                        // If the player moves while hitting the ball, we bounce in a special way.
                        if (
                            previousGameState.players.get(playerIndex).y
                            !== gameState.players.get(playerIndex).y
                        ) {
                            const racketMovedUp = (
                                previousGameState.players.get(playerIndex).y
                                > gameState.players.get(playerIndex).y
                            );

                            let baseAngle         = 0;
                            let amplitudeReversed = racketMovedUp;

                            if (racketMovedUp) {
                                if (gameState.ball.goingLeft()) {
                                    baseAngle = Math.PI / 2;
                                }
                            } else if (gameState.ball.goingLeft()) {
                                baseAngle = Math.PI;
                            } else {
                                baseAngle = 3 * Math.PI / 2;
                            }

                            const racketLine = Collisions.yRacketLine(
                                gameState, previousGameState, playerIndex
                            );

                            const rawRacketPercent = (
                                (gameState.ball.y - racketLine.lo) /
                                (racketLine.hi - racketLine.lo)
                            );

                            const racketPercent = clamp(
                                0.5,
                                1, (
                                    racketMovedUp
                                    ? 1 - rawRacketPercent
                                    : rawRacketPercent
                                )
                            );

                            const rawControlAmplitude = clamp(0.25, 0.75, 2 * (racketPercent - 0.5));

                            const controlAmplitude = (
                                amplitudeReversed
                                ? 1 - rawControlAmplitude
                                : rawControlAmplitude
                            );

                            gameState.ball = gameState.ball.set("angle", (
                                2 * Math.PI + baseAngle + controlAmplitude * Math.PI / 2
                            ) % (Math.PI * 2));
                        }
                    });
                });
            });
        });
    });
};

methodify(GameState, ["next"]);

module.exports = GameState;
