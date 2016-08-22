const Ball      = require("./ball");
const Immutable = require("immutable");
const GameFacts = require("./game-facts");

let GameState = Immutable.Record({
    player1Score: 0,
    player2Score: 0,

    player1Y: GameFacts.centeredRacketPosition,
    player2Y: GameFacts.centeredRacketPosition,

    ball: new Ball(),

    hrtime: process.hrtime();
});

module.exports = GameState;

GameState.initial = () => new GameState({
    ball:   new Ball(),
    hrtime: process.hrtime();
});
