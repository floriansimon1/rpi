"use strict";

module.exports = (refX, refY, x, y) => Math.sqrt(
    Math.pow(refX - x, 2)
    + Math.pow(refY - y, 2)
);
