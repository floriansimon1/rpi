const _ = require("lodash");

module.exports = {	
	randomColor: () => (
		_([Math.random() * 200, Math.random() * 200, Math.random() * 200])
		.map(Math.round)
		.thru(color => ({ r: color[0], g: color[1], b: color[2] }))
		.value()
	),

    randomMultiplier: () => Math.random * 2 < 1 ? -1 : 1,

	randomSpeed: left => {
        var proportion  = Math.random();
        var xMultiplier = module.exports.randomMultiplier();

        if (left === true) {
            xMultiplier = -1;
        } else if (left === false) {
            xMultiplier = 1;
        }

        const total = 4 + Math.random() * 2;

        while (proportion < 0.25 || proportion > 0.75) proportion = Math.random();

        return {
            x: proportion * total * xMultiplier,
            y: (1 - proportion) * total * module.exports.randomMultiplier()
        };
    },

	distance: (refX, refY, x, y) => Math.sqrt(
		Math.pow(refX - x, 2)
		+ Math.pow(refY - y, 2)
	)
};
