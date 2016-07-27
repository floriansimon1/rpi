const LedMatrix = require("node-rpi-rgb-led-matrix");

var prout = new LedMatrix(32);

prout.fill(0, 0, 0);

for (var i = 0; i < 64; i++) {
	prout.setPixel(i, 31, 0, 0, 255);
}

setInterval(() => {
	prout.fill(0, 0, 0);

	for (var i = 0; i < 64; i++) {
		for (var j = 0; j < 32; j++) {
			prout.setPixel(i, j, Math.random() * 255, Math.random() * 255, Math.random() * 255);
		}
	}
}, 1000);

console.log('Salut Nana la mocheté');
