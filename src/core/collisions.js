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

    // Directions.UP or Directions.DOWN.
    vertical: Maybe.Nothing(),

    // Player index.
    player: Maybe.Nothing()
});

let Collisions = { Collision };

Collisions.yRacketLine = _.curry((state, oldState, playerIndex) => ({
    lo: Math.min(state.players.get(playerIndex).y, oldState.players.get(playerIndex).y),

    hi: Math.max(
        state.players.get(playerIndex).y + GameFacts.rackeHeight,
        oldState.players.get(playerIndex).y + GameFacts.rackeHeight
    )
}));

// Returns a collision object.
Collisions.detectBallCollisions = (state, oldState) => {
    const makeRacketLine = Collisions.yRacketLine(state, oldState);

    const ballYOnYRacketLine = playerIndex => {
        const racketLine = makeRacketLine(playerIndex);

        return between(
            racketLine.lo,
            racketLine.hi,
            clamp(GameFacts.lowestY, GameFacts.racketMaxPosiion, state.ball.y)
        )
    };

    const top = valueOnCondition(Directions.UP, (
        state.ball.y <= GameFacts.lowestY
        && state.ball.angle < Math.PI / 2
    ));

    const bottom = valueOnCondition(Directions.DOWN, (
        state.ball.y + GameFacts.ballHeight >= GameFacts.highestY
        && state.ball.angle > Math.PI / 2
    ));

    const vertical = top.orElse(() => bottom);

    const left = valueOnCondition(Directions.LEFT, (
        state.ball.x <= GameFacts.lowestX
        && state.ball.xDirection === -1
    ));

    const right = valueOnCondition(Directions.RIGHT, (
        state.ball.x + GameFacts.ballWidth >= GameFacts.highestX
        && state.ball.xDirection === 1
    ));

    const horizontal = left.orElse(() => right);

    const leftPlayer = valueOnCondition(_, (
        state.ball.x <= GameFacts.lowestX + (GameFacts.playerCollisionZoneWidth - 1)
        && state.ball.xDirection === -1
    ))
    .chain(() => valueOnCondition(0, ballYOnYRacketLine(0)));

    const rightPlayer = valueOnCondition(_, (
        state.ball.x >= GameFacts.highestX - (GameFacts.playerCollisionZoneWidth - 1)
        && state.ball.xDirection === 1
    ))
    .chain(() => valueOnCondition(1, ballYOnYRacketLine(1)))

    const player = leftPlayer.orElse(() => rightPlayer);

    return vertical
    .orElse(() => horizontal)
    .orElse(() => player)
    .map(() => new Collision({ vertical, horizontal, player }));
};

module.exports = Collisions;
