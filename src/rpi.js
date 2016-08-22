const LedMatrix  = require("node-rpi-rgb-led-matrix");
const controller = require("./io/controller");
const utils      = require("./utils");
const _          = require("lodash");

var matrix = new LedMatrix(32, 2);

const render = require('./render')(matrix);

controller.initialize();

controller.on('keydown', (__, key) => {
    if (key === 'SELECT') {
        controller.close();

        process.exit();
    }
});

const game = () => {
    // A few constants.
    const gameSpeed          = 200;
    const width              = 64;
    const height             = 32;

    // A few functions used in init.
    const centerBall = () => {
        ballX = width / 2 - 1;
        ballY = height / 2 - 1;
    };

    // Intialization.
    var player1Y     = (height - racketHeight) / 2;
    var player2Y     = (height - racketHeight) / 2;
    var player1Score = 0;
    var player2Score = 0;

    var ballX;
    var ballY;
    var ballSpeedX;
    var ballSpeedY;
    var drawInterval;

    (() => {
        var randomSpeed = utils.randomSpeed();

        ballSpeedX = randomSpeed.x;
        ballSpeedY = randomSpeed.y;
    })();

    centerBall();

    const movePlayer = playerName => {
        const playerNo = playerName[1];

        const down            = controller.keysPressed[playerNo].DOWN ? 1 : 0;
        const up              = controller.keysPressed[playerNo].UP ? -1 : 0;
        const currentPosition = playerName === "P1" ? player1Y : player2Y;

        const direction = up + down;

        var newY = currentPosition + direction * racketStep;

        if (newY < 0) {
            newY = 0;
        } else if (newY + 5 > 31) {
            newY = 26;
        }

        if (playerName === "P1") {
            player1Y = newY;
        } else {
            player2Y = newY;
        }
    };

    const incrementScore = player => {
        if (player === "P1") {
            player1Score++;
        } else {
            player2Score++;
        }

        const score = player === "P1" ? player1Score : player2Score;
        const color = player === "P1" ? player1Color : player2Color;

        if (score > 9) {
            clearInterval(drawInterval);

            var restartIntervalId = setTimeout(game, 10000);

            controller.on("keyup", function handler(__, key) {
                if (key === "START") {
                    clearTimeout(restartIntervalId);

                    controller.removeListener("keyup", handler);

                    game();
                }
            });

            matrix.clear();

            drawScore("left", player1Color, player1Score, 4);
            drawScore("right", player2Color, player2Score, 4);

            _.range(width).forEach(x => {
                matrix.setPixel(x, 0, color.r, color.g, color.b);
                matrix.setPixel(x, 1, color.r, color.g, color.b);

                matrix.setPixel(x, height - 1, color.r, color.g, color.b);
                matrix.setPixel(x, height - 2, color.r, color.g, color.b);
            });
        }
    };

    const moveBall = () => {
        const newBallX = ballX + ballSpeedX;
        const newBallY = ballY + ballSpeedY;

        // Bouncing on a racket.
        if (
            newBallY >= player1Y
            && newBallY <= player2Y + racketHeight
            && (newBallX <= 1 || newBallX >= width - 3)
        ) {
            ballY = newBallY;

            if (ballX < width / 2) {
                ballX = 2;
            } else {
                ballX = width - 3;
            }

            ballSpeedX *= -1;
        } else if (newBallX + 1 > width - 2) {
            // Left player scores.
            centerBall();

            const speed = utils.randomSpeed(true);

            ballSpeedX = speed.x;
            ballSpeedY = speed.y;

            return "P1";
        } else if (newBallX < 2) {
            // Right player scores.
            centerBall();

            const speed = utils.randomSpeed(false);

            ballSpeedX = speed.x;
            ballSpeedY = speed.y;

            return "P2";
        } else if (newBallY + 1 > height - 1 || newBallY < 0) {
            ballSpeedY *= -1;

            if (newBallY < 0) {
                ballY = 0;
            } else {
                ballY = height - 2;
            }
        } else {
            ballX = newBallX;
            ballY = newBallY;
        }

        return null;
    };

    // Main loop.
    drawInterval = setInterval(() => render(gameState = nextState(gameState)), gameSpeed);
};

game();
