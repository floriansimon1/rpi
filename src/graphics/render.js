"use strict";

const GameFacts  = require("../core/game-facts");
const Directions = require("../core/directions");
const distance   = require("../utils/distance");
const Maybe      = require("data.maybe");
const symbols    = require("./symbols");
const _          = require("lodash");

module.exports = matrix => {
    const victoryScreen = gameState => {
        const playerColor = playerIndex => GameFacts[`player${playerIndex + 1}Color`];

        const winnerColor = playerColor(gameState.victoryDetails.get().winnerIndex);

        drawScore(
            Directions.RIGHT,
            playerColor(1),
            gameState.players.get(1).score,
            GameFacts.victoryScoreY
        );

        drawScore(
            Directions.LEFT,
            playerColor(0),
            gameState.players.get(0).score,
            GameFacts.victoryScoreY
        );

        _.range(GameFacts.width).forEach(x => {
            matrix.setPixel(x, GameFacts.lowestY, winnerColor.r, winnerColor.g, winnerColor.b);
            matrix.setPixel(x, GameFacts.lowestY + 1, winnerColor.r, winnerColor.g, winnerColor.b);

            matrix.setPixel(x, GameFacts.highestY, winnerColor.r, winnerColor.g, winnerColor.b);
            matrix.setPixel(x, GameFacts.highestY - 1, winnerColor.r, winnerColor.g, winnerColor.b);
        });
    };

    const gameScreen = gameState => {
        drawField();

        drawScore(
            Directions.RIGHT,
            GameFacts.player2Color,
            gameState.players.get(1).score,
            GameFacts.gameScoreY
        );

        drawScore(
            Directions.LEFT,
            GameFacts.player1Color,
            gameState.players.get(0).score,
            GameFacts.gameScoreY
        );

        drawPlayer(Directions.RIGHT, GameFacts.player2Color, gameState.players.get(1).y);
        drawPlayer(Directions.LEFT, GameFacts.player1Color, gameState.players.get(0).y);

        drawBall(GameFacts.ballColor, Math.round(gameState.ballX), Math.round(gameState.ballY));
    };

    const drawSymbol = (symbol, xOffset, yOffset, optionalColor) => {
        const symbolWidth  = symbol[0].length;
        const symbolHeight = symbol.length;

        _.range(symbolWidth).forEach(symbolX => {
            _.range(symbolHeight).forEach(symbolY => {
                const letter = symbol[symbolY][symbolX];
                const realX  = xOffset + symbolX;
                const realY  = yOffset + symbolY;

                if (letter !== " ") {
                    const color = optionalColor.getOrElse(GameFacts.colorsByLetter[letter]);

                    matrix.setPixel(realX, realY, color.r, color.g, color.b);
                }
            });
        });
    };

    const drawField = () => {
        // Middle line
        _.range(GameFacts.height).forEach(y => {
            matrix.setPixel(
                GameFacts.leftMiddleLineX,
                y,
                GameFacts.fieldColor.r,
                GameFacts.fieldColor.g,
                GameFacts.fieldColor.b
            );

            matrix.setPixel(
                GameFacts.rightMiddleLineX,
                y,
                GameFacts.fieldColor.r,
                GameFacts.fieldColor.g,
                GameFacts.fieldColor.b
            );
        });

        // Center circle
        [Directions.LEFT, Directions.RIGHT].forEach(horizontal => (
            [Directions.TOP, Directions.BOTTOM].forEach(vertical => {
                const centerX = GameFacts.xCenter - (horizontal === Directions.LEFT ? 1  : 0);
                const centerY = GameFacts.yCenter - (vertical === Directions.TOP ? 1 : 0);

                const xMultiplier = horizontal === Directions.LEFT ? -1 : 1;
                const yMultiplier = vertical === Directions.TOP ? -1 : 1;

                _.range(GameFacts.middleCircleRadius).forEach(circleX => (
                    _.range(GameFacts.middleCircleRadius).forEach(circleY => {
                        const realX = centerX + circleX * xMultiplier;
                        const realY = centerY + circleY * yMultiplier;

                        const delta = Math.round(distance(centerX, centerY, realX, realY));

                        if (Math.round(delta) === GameFacts.middleCircleRadius - 1) {
                            matrix.setPixel(
                                realX,
                                realY,
                                GameFacts.fieldColor.r,
                                GameFacts.fieldColor.g,
                                GameFacts.fieldColor.b
                            );
                        }
                    })
                ))
            })
        ));
    };

    const drawPlayer = (side, color, y) => {
        const x = side === Directions.LEFT ? GameFacts.leftRacketX : GameFacts.rightRacketX;

        _.range(GameFacts.racketHeight).forEach(racketY => {
            matrix.setPixel(x, y + racketY, color.r, color.g, color.b);
        });
    };

    const drawScore = (side, color, score, y) => {
        drawSymbol(
            symbols.digits[score],
            GameFacts.xCenter + (
                side === Directions.LEFT
                ? GameFacts.leftScoreXCenterDistance
                : GameFacts.rightScoreXCenterDistance
            ),
            y,
            Maybe.of(color)
        );
    };

    const drawBall = (color, x, y) => {
        _.range(GameFacts.ballWidth).forEach(ballX => {
            _.range(GameFacts.ballHeight).forEach(ballY => {
                matrix.setPixel(ballX + x, ballY + y, color.r, color.g, color.b);
            });
        });
    };

    return gameState => {
        matrix.clear();

        if (gameState.victoryDetails.isJust) {
            victoryScreen(gameState);
        } else {
            gameScreen(gameState);
        }
    };
};
