const Ball      = require("./ball");
const Immutable = require("immutable");
const Direction = require("./direction");
const GameFacts = require("./game-facts");
const methodify = require("./utils/methodify");

let GameState = Immutable.Record({
    player1Score: 0,
    player2Score: 0,

    player1Y: 0,
    player2Y: 0,

    ball: new Ball(),

    hrtime: process.hrtime();
});

GameState.initial = () => new GameState({ hrtime: process.hrtime() });

GameState.next = (player1Direction, player2Direction) => {
    movePlayer("P1");
    movePlayer("P2");

    const scoringPlayer = moveBall();

    if (scoringPlayer) incrementScore(scoringPlayer);
};

methodify(GameState, { next: GameState.next });

module.exports = GameState;
