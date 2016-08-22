const HID          = require("node-hid");
const EventEmitter = require("events");
const _            = require("lodash");

var devices;
var pressed;

var nbPlayers = 2;

var controller = new EventEmitter();

const keyPath = (byte, value, shift) => ({ byte, value, shift });

const keys = {
    LEFT:    keyPath(3, 0, 4),
    UP:      keyPath(4, 0, 4),
    Y:       keyPath(5, 128),
    RIGHT:   keyPath(3, 255),
    DOWN:    keyPath(4, 255),
    SELECT:  keyPath(6, 16),
    START:   keyPath(6, 32),
    A:       keyPath(5, 32),
    B:       keyPath(5, 64),
    X:       keyPath(5, 16),
    LT:      keyPath(6, 1),
    RT:      keyPath(6, 2)
};

const keyNames = Object.keys(keys);

controller.keysPressed = _.zipObject(
    _.range(1, 3),
    _.times(nbPlayers, () => _.zipObject(keyNames, keyNames.map(_.constant(false))))
);

controller.initialize = () => {
    devices = HID
    .devices()
    .filter(device => (
        device.vendorId === 121
        && device.productId === 17
    ))
    .map((device, i) => Object.assign(new HID.HID(device.path), { player: i + 1 }));

    devices.forEach(device => {
        device.on('data', data => {
            keyNames.forEach(keyName => {
                const keyPath = keys[keyName];

                const pressed = (
                    keyPath.shift
                    ? (data[keyPath.byte] >> keyPath.shift) === keyPath.value
                    : (data[keyPath.byte] & keyPath.value) === keyPath.value
                );

                if (controller.keysPressed[device.player][keyName] !== pressed) {
                    controller.emit(`key${pressed ? 'down' : 'up'}`, device.player, keyName);
                }

                controller.keysPressed[device.player][keyName] = pressed;
            });
        });
    });
};

controller.close = () => {
    devices.forEach(device => device.close());
};

controller.keyNames = keyNames;

module.exports = controller;
