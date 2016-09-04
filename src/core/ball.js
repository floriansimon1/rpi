"use strict";

const randomSign = require("../utils/random-sign");
const callUntil  = require("../utils/call-until");
const methodify  = require("../utils/methodify");
const between    = require("../utils/between");
const clamp      = require("../utils/clamp");
const GameFacts  = require("./game-facts");
const Immutable  = require("immutable");

const randomAngle = () => Math.random() * Math.PI;

let Ball = Immutable.Record({
    // One of 1 or -1.
    xDirection: 1,

    // In pixels/s.
    speed: GameFacts.initialBallSpeed,

    // In radians
    angle: Math.PI / 2,

    x: GameFacts.ballCenterX,
    y: GameFacts.ballCenterY
});

Ball.initial = values => new Ball(Object.assign({
    angle:      callUntil(randomAngle, between(GameFacts.minAngle, GameFacts.maxAngle)),
    xDirection: randomSign()
}, values || {}));

Ball.move = (ball, Δs) => {
    const travelled  = Δs * ball.speed;
    const yDirection = ball.angle > Math.PI / 2 ? 1 : -1;

    const Δy = yDirection * (
        ball.angle !== Math.PI / 2
        ? Math.cos(ball.angle < Math.PI / 2 ? ball.angle : Math.PI - ball.angle) * travelled
        : 0
    );

    const Δx = ball.xDirection * (
        ball.angle !== Math.PI / 2
        ? Math.sin(ball.angle < Math.PI / 2 ? ball.angle : Math.PI - ball.angle) * travelled
        : travelled
    );

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
Ball.oppositeAngle      = ball => Math.PI - ball.angle;

methodify(Ball, ["move", "oppositeXDirection", "oppositeAngle"]);

module.exports = Ball;
