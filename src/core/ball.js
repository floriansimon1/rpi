const randomSign = require('./utils/random-sign');
const callUntil  = require('./utils/call-until');
const methodify  = require('./utils/methodify');
const between    = require('./utils/between');
const between    = require('./utils/clamp');
const Immutable  = require("immutable");

let Ball = Immutable.Record({
    // One of 1 or -1.
    xDirection: 1,

    // In pixels/s.
    speed: GameFacts.initialBallSpeed,

    // In radians
    angle: Math.PI,

    x: GameFacts.ballCenterX,
    y: GameFacts.ballCenterY
});

Ball.initial = values => Object.assign(new Ball({
    proportion: callUntil(Math.random, between(GameFacts.minAngle, GameFacts.maxAngle)),
    xDirection: randomSign()
}), values || {});

Ball.move = (ball, Δs) => {
    const traveled = Δs * ball.speed;

    const Δy = Math.cos(2 * Math.PI - ball.angle) * traveled;
    const Δx = Math.cos(ball.angle) * traveled * ball.xDirection;

    return ball
    .set("x", clamp(
        GameFacts.lowestX,
        GameFacts.highestX - (GameFacts.ballWidth - 1),
        ball.x + Δx
    ))
    .set("y", clamp(
        GameFacts.lowestY,
        GameFacts.highestY - (GameFacts.ballHeight - 1),
        ball.y + Δy
    ));
};

Ball.oppositeXDirection = ball => ball.xDirection * -1;
Ball.oppositeAngle      = ball => 2 * Math.PI - ball.angle;

methodify(Ball, ["move", "oppositeXDirection", "oppositeAngle"]);

module.exports = Ball;
