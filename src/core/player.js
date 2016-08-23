const Immutable = require("immutable");
const GameFacts = require("./game-facts");
const methodify = require("../utils/methodify");

let PlayerRecord = Immutable.Record({
    score: 0,
    y:     GameFacts.centeredRacketPosition
});

PlayerRecord.move = Player.move = (player, controller) => {
    const playerNo = playerName[1];

    const down = player.controller.keysPressed.DOWN ? 1 : 0;
    const up   = player.controller.keysPressed.UP ? -1 : 0;

    const direction = up + down;

    var newY = player.y + direction * racketStep;

    if (newY < GameFacts.lowestY) {
        newY = GameFacts.lowestY;
    } else if (newY > GameFacts.racketMaxPosition) {
        newY = GameFacts.racketMaxPosition;
    }

    return player.set("y", newY);
};

methodify(Player, ["move"]);

module.exports = Player;
