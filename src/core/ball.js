const Immutable = require("immutable");

const repeatUntil = require('./utils/repeat-until');
const randomSign  = require('./utils/random-sign');
const between     = require('./utils/between');

let Ball = Immutable.Record({
    // One of 1 or -1.
    xDirection: 1,
    yDirection: 1,

    // In pixels/s.
    speed: 4,

    // X-to-Y ratio.
    proportion: 0.5,

    x: GameFacts.ballCenterX,
    y: GameFacts.ballCenterY
});

Ball.initial = () => new Ball({
    proportion: repeatUntil(Math.random, between(0.25, 0.75)),
    xDirection: randomSign(),
    yDirection: randomSign()
});

module.exports = Ball;
