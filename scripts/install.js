#!/usr/local/bin/node

const cmd = require("child_process").execSync;

cmd("sudo npm install node-gyp -g");
cmd("npm install");
cmd(`cp ${__dirname}/../contrib/binding.gyp ${__dirname}/../node_modules/node-rpi-rgb-led-matrix/`);
cmd("node-gyp configure", { cwd: `${__dirname}/../node_modules/node-rpi-rgb-led-matrix/` });
cmd("node-gyp build", { cwd: `${__dirname}/../node_modules/node-rpi-rgb-led-matrix/` });
