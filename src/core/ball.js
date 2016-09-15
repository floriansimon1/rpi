"use strict";

const randomSign = require("../utils/random-sign");
const callUntil  = require("../utils/call-until");
const methodify  = require("../utils/methodify");
const between    = require("../utils/between");
const clamp      = require("../utils/clamp");
const GameFacts  = require("./game-facts");
const Immutable  = require("immutable");

const randomAngle = () => {
    let nbQuarters = 1;

    let randomQuartersSeed = Math.random();

    if (randomQuartersSeed > 0.66) {
        nbQuarters = 3;
    } else if (randomQuartersSeed > 0.33) {
        nbQuarters = 2;
    }

    const quarterPosition = callUntil(Math.random, between(0.5, 0.8)) * Math.PI / 2;

    return nbQuarters * Math.PI / 2 + quarterPosition;
};

let Ball = Immutable.Record({
    color: GameFacts.ballInitialColor,

    // In pixels/s and radians. Think of those as polar coordinates.
    speed: GameFacts.initialBallSpeed,
    angle: Math.PI / 2,

    x: GameFacts.ballCenterX,
    y: GameFacts.ballCenterY
});

Ball.initial = values => new Ball(Object.assign({
    angle: randomAngle()
}, values || {}));

Ball.move = (ball, Δs) => {
    const travelled  = Δs * ball.speed;

    const Δx = travelled * Math.cos(ball.angle);

    // Y coordinates are reversed because y0 is at the top of the screen.
    const Δy = travelled * Math.sin(ball.angle) * -1;

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

Ball.goingLeft  = ball => between(Math.PI / 2, 3 * Math.PI / 2, ball.angle % (2 * Math.PI));
Ball.goingRight = ball => (ball.angle + Math.PI / 2) % (2 * Math.PI) < Math.PI;

// Y coordinates are reversed because y0 is at the top of the screen.
Ball.goingDown = ball => ball.angle % (2 * Math.PI) > Math.PI;
Ball.goingUp   = ball => ball.angle % (2 * Math.PI) < Math.PI;

Ball.bounceVertically = ball => ball.set("angle", (
    ball.angle
    + 3 * Math.PI
    - 2 * (ball.angle % Math.PI - Math.PI / 2)
) % (2 * Math.PI));

Ball.bounceHorizontally = ball => ball.set("angle", (
    ball.angle
    + 3 * Math.PI
    - 2 * ((ball.angle - Math.PI / 2) % Math.PI - Math.PI / 2)
) % (2 * Math.PI));

Ball.oppositeDirection = ball => ball.set("angle", ball.angle + Math.PI % (Math.PI / 2));

Ball.accelerate = ball => (
    ball
    .set("speed", clamp(0, GameFacts.maxBallSpeed, ball.speed + GameFacts.bounceSpeedIncrement))
    .set("color", Object.assign({}, ball.color, {
        g: clamp(0, 255, ball.color.g - GameFacts.ballColorGreenDecrease)
    }))
);

methodify(Ball, [
    "bounceHorizontally", "move", "bounceVertically",
    "oppositeDirection", "goingLeft", "goingRight",
    "goingUp", "goingDown", "accelerate"
]);

module.exports = Ball;
