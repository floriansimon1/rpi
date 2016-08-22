const GameFacts  = require("../core/game-facts");
const Directions = require("../core/directions");
const distance   = require("../utils/distance");
const symbols    = require("./symbols");
const _          = require("lodash");

module.exports = matrix => {
    const drawSymbol = (symbol, optionalX, optionalY, optionalColor) => {
        const symbolWidth  = symbol[0].length;
        const symbolHeight = symbol.length;

        const xOffset = optionalX.getOrElse(Math.round(Math.random() * GameFacts.width));
        const yOffset = optionalY.getOrElse(Math.round(Math.random() * GameFacts.heigth));

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
        const x = side === Directions.LEFT ? 1 : GameFacts.width - 2;

        _.range(GameFacts.racketHeight).forEach(y => {
            matrix.setPixel(x, y + i, color.r, color.g, color.b);
        });
    };

    const drawScore = (side, color, score, y) => {
        drawSymbol(
            symbols.digits[score],
            GameFacts.centerX + (
                side === Directions.LEFT
                ? GameFacts.leftScoreXCenterDistance
                : GameFacts.rightScoreXCenterDistance
            ),
            y,
            color
        );
    };

    const drawBall = (color, x, y) => {
        matrix.setPixel(x,     y,     color.r, color.g, color.b);
        matrix.setPixel(x + 1, y,     color.r, color.g, color.b);
        matrix.setPixel(x,     y + 1, color.r, color.g, color.b);
        matrix.setPixel(x + 1, y + 1, color.r, color.g, color.b);
    };

    return gameState => {
        matrix.clear();

        drawField();

        drawScore(Directions.RIGHT, GameFacts.player2Color, gameState.player2Score, 2);
        drawScore(Directions.LEFT, GameFacts.player1Color, gameState.player1Score, 2);

        drawPlayer(Directions.RIGHT, GameFacts.player2Color, gameState.player2Y);
        drawPlayer(Directions.LEFT, GameFacts.player1Color, gameState.player1Y);

        drawBall(ballColor, Math.round(gameState.ballX), Math.round(gameState.ballY));
    };
};
