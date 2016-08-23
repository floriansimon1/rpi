"use strict";

const valueOnCondition = require("../utils/value-on-condition");
const between          = require("../utils/between");
const clamp            = require("../utils/clamp");
const Directions       = require("./directions");
const GameFacts        = require("./game-facts");
const Maybe            = require("data.maybe");
const Immutable        = require("immutable");
const _                = require("lodash");

const Collision = Immutable.Record({
    // Directions.LEFT or Directions.RIGHT.
    horizontal: Maybe.Nothing(),

    // Directions.TOP or Directions.BOTTOM.
    vertical: Maybe.Nothing(),

    // Player index.
    player: Maybe.Nothing()
});

let Collisions = { Collision };

Collisions.yRacketLine = _.curry((state, oldState, playerIndex) => ({
    lo: Math.min(state.players[playerIndex].y, oldState.players[playerIndex].y)
    hi: Math.max(
        state.players[playerIndex].y + GameFacts.rackeHeight,
        oldState.players[playerIndex].y + GameFacts.rackeHeight
    )
}));

// Returns a collision object.
Collisions.detectBallCollisions = (state, oldState) => {
    const racketLine = Collisions.yRacketLine(state, oldState, playerIndex);

    const ballYOnYRacketLine = between(
        racketLine.lo,
        racketLine.hi,
        clamp(GameFacts.lowestY, GameFacts.highestX, state.ball.y)
    );

    const yBallOnYRacketLine = Collisions.yBallOnYRacketLine(state, oldState);

    const top = valueOnCondition(Directions.TOP, state.ball.y <= GameFacts.lowestY);

    const bottom = valueOnCondition(Directions.BOTTOM, (
        state.ball.y + GameFacts.ballHeight >= GameFacts.highestY
    ));

    const vertical = top.orElse(() => bottom);

    const left = valueOnCondition(Directions.LEFT, state.ball.x <= GameFacts.lowestX);

    const right = valueOnCondition(Directions.RIGHT, (
        state.ball.x + GameFacts.ballWidth >= GameFacts.highestX
    ));

    const horizontal = left.orElse(() => right);

    const leftPlayer = valueOnCondition(_, (
        state.ball.x <= GameFacts.lowestX + (GameFacts.playerCollisionZoneWidth - 1)
    ))
    .chain(() => valueOnCondition(0, ballYOnYRacketLine(0)));

    const rightPlayer = valueOnCondition(_, (
        state.ball.x >= GameFacts.highestX - (GameFacts.playerCollisionZoneWidth - 1)
    ))
    .chain(() => valueOnCondition(1, ballYOnYRacketLine(1)))

    return vertical
    .orElse(() => horizontal)
    .orElse(() => player)
    .map(() => new Collision({ vertical, horizontal, player }));
};

module.exports = Collisions;
