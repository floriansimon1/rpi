const initialize = function () {
	this.socket = require('dgram').createSocket('udp4');
};

module.exports = {
	/* Members. */
	socket: null,

	initialize
};
