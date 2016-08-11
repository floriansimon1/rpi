const LedMatrix  = require("node-rpi-rgb-led-matrix");
const controller = require("./controller");
const symbols    = require("./symbols");
const utils      = require("./utils");
const _          = require("lodash");

controller.initialize();

controller.on('keydown', key => {
    if (key === 'ESCAPE') {
        controller.close();

        process.exit();
    }
});

var matrix = new LedMatrix(32, 2);

const game = () => {
	// A few constants.
	const fieldColor         = { r: 255, g: 255, b: 255 };
	const player1Color       = { r: 0,   g: 0,   b: 255 };
	const ballColor          = { r: 255, g: 255, b: 0 };
	const player2Color       = { r: 255, g: 0,   b: 0 };
	const gameSpeed          = 50;
	const width              = 64;
	const height             = 32;
	const racketHeight       = 6;
	const middleCircleRadius = 5;
    const racketStep         = 3;

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

	// Functions.
	const drawSymbol = (symbol, optionalX, optionalY, optionalColor) => {
		const colorsByLetter = {
			X: { r: 255, g: 150, b: 150 },
			O: { r: 255, g:   0, b:   0 },
			K: { r:  68, g:  21, b:   0 }
		};

		const symbolWidth  = symbol[0].length;
		const symbolHeight = symbol.length;

		var x = optionalX;
		var y = optionalY;

		if (optionalX === undefined) {
			y = Math.round(Math.random() * height);
			x = Math.round(Math.random() * width);
		}

		_.range(symbolWidth).forEach(i => {
			_.range(symbolHeight).forEach(j => {
				const letter = symbol[j][i];
				const a      = x + i;
				const b      = y + j;

				var color = optionalColor || colorsByLetter[letter];

				if (letter !== " ") {
					matrix.setPixel(
						x + i, y + j,
						color.r, color.g, color.b
					);
				}
			});
		});
	};

	const drawField = () => {
		// Middle line
		_.range(height).forEach(i => {
			matrix.setPixel(width / 2 - 1, i, fieldColor.r, fieldColor.g, fieldColor.b);
			matrix.setPixel(width / 2, i, fieldColor.r, fieldColor.g, fieldColor.b);
		});

		// Center circle
		["left", "right"].forEach(horizontal => (
			["top", "bottom"].forEach(vertical => {
				const centerX = width / 2 - (horizontal === "left" ? 1  : 0);
				const centerY = height / 2 - (vertical === "top" ? 1 : 0);

				const xMultiplier = horizontal === "left" ? -1 : 1;
				const yMultiplier = vertical === "top" ? -1 : 1;

				_.range(middleCircleRadius).forEach(i => (
					_.range(middleCircleRadius).forEach(j => {
						const circleX = centerX + i * xMultiplier;
						const circleY = centerY + j * yMultiplier;

						const distance = utils.distance(centerX, centerY, circleX, circleY);

						if (Math.round(distance) === middleCircleRadius - 1) {
							matrix.setPixel(
								circleX, circleY,
								fieldColor.r, fieldColor.g, fieldColor.b
							);
						}
					})
				))
			})
		));
	};

	const drawPlayer = (side, color, y) => {
		const x = side === "left" ? 1 : width - 2;

		_.range(racketHeight).forEach(i => {
			matrix.setPixel(x, y + i, color.r, color.g, color.b);
		});
	};

	const drawScore = (side, color, score, y) => {
		drawSymbol(
			symbols.digits[score],
			width / 2 + (side === "left" ? -8 : 5 ),
			y, color
		);
	};

	const drawBall = (color, x, y) => {
		matrix.setPixel(x,     y,     color.r, color.g, color.b);
		matrix.setPixel(x + 1, y,     color.r, color.g, color.b);
		matrix.setPixel(x,     y + 1, color.r, color.g, color.b);
		matrix.setPixel(x + 1, y + 1, color.r, color.g, color.b);
	};

	const movePlayer = playerName => {
        const down            = controller.keysPressed[`${playerName}_DOWN`] ? 1 : 0;
        const up              = controller.keysPressed[`${playerName}_UP`] ? -1 : 0;
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

            controller.on("keyup", function handler(key) {
                if (key === "SPACE") {
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
	drawInterval = setInterval(() => {
		movePlayer("P1");
		movePlayer("P2");

		const scoringPlayer = moveBall();

		matrix.clear();

		drawField();

		drawScore("right", player2Color, player2Score, 2);
		drawScore("left", player1Color, player1Score, 2);

		drawPlayer("right", player2Color, player2Y);
		drawPlayer("left", player1Color, player1Y);

		drawBall(ballColor, Math.round(ballX), Math.round(ballY));

		if (scoringPlayer) incrementScore(scoringPlayer);
	}, gameSpeed);
};

game();
