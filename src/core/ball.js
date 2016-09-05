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
    // In pixels/s and radians. Think of those as polar coordinates.
    speed: GameFacts.initialBallSpeed,
    angle: Math.PI / 2,

    x: GameFacts.ballCenterX,
    y: GameFacts.ballCenterY
});

Ball.initial = values => new Ball(Object.assign({
    angle: (
        callUntil(randomAngle, between(GameFacts.minAngle, GameFacts.maxAngle))
        + (Math.random() > 0.5 ? Math.PI : 0)
    )
}, values || {}));

Ball.move = (ball, Δs) => {
    const travelled  = Δs * ball.speed;

    const Δx = travelled * Math.cos(ball.angle);
    const Δy = travelled * Math.sin(ball.angle);

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

Ball.bounce = ball => (
    ball.angle % Math.PI > Math.PI / 2
    ? ball.angle - Math.PI / 2
    : ball.angle + Math.PI / 2
) % (2 * Math.PI);

Ball.oppositeAngle = ball => ball.angle + Math.PI % (Math.PI / 2);

methodify(Ball, ["move", "bounce", "oppositeAngle"]);

module.exports = Ball;
