"use strict";

const _                = require("lodash");
const Ball             = require("./ball");
const Player           = require("./player");
const Immutable        = require("immutable");
const Maybe            = require("data.maybe");
const Collisions       = require("./collisions");
const Directions       = require("./directions");
const GameFacts        = require("./game-facts");
const between          = require("../utils/between");
const methodify        = require("../utils/methodify");
const valueOnCondition = require("../utils/value-on-condition");

// In nanoseconds.
const getElapsedTimeSince = point => {
    const [s, ns] = process.hrtime(point);

    return s + ns * Math.pow(10, -9);
};

let GameState = Immutable.Record({
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
    // Waits for a START button press to start a new game.
    if (gameState.victoryDetails.isJust) {
        if (controllers.find(controller => controller.keysPressed.START)) {
            return GameState.initial();
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

        // Ball movement.
        gameState.ball = gameState.ball.move(Δs);

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
                        gameState.ball = gameState.ball.bounceHorizontally();
                    });
                });
            });
        });
    });
};

methodify(GameState, ["next"]);

module.exports = GameState;
