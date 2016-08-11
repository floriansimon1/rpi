const HID          = require("node-hid");
const EventEmitter = require("events");
const _            = require("lodash");

var devices;
var pressed;

var controller = new EventEmitter();

const keys = {
    ESCAPE:  41,
    SPACE:   44,
    P2_UP:   82,
    P2_DOWN: 81,
    P1_UP:   26,
    P1_DOWN: 22
};

const keyNames = Object.keys(keys);

const keyByCode = _.zipObject(_.values(keys), keyNames);

controller.keysPressed = _.zipObject(keyNames, _.times(keyNames.length, _.constant(false)));

controller.initialize = () => {
    devices = HID.devices().map(device => new HID.HID(device.path));

    devices.forEach(device => {
        device.on('data', data => {
            const pressed = new Set(_(data).drop(2).takeWhile().value());

            keyNames.forEach(key => {
                if (controller.keysPressed[key]) {
                    controller.emit('keyup', key);
                } else if (pressed.has(keys[key])) {
                    controller.emit('keydown', key);
                }
                
                controller.keysPressed[key] = pressed.has(keys[key]);
            });
        });
    });
};

controller.close = () => {
    devices.forEach(device => device.close());
};

controller.keyNames = keyNames;

module.exports = controller;
