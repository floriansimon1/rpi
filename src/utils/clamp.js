"use strict";

module.exports = require("lodash").curry((lo, hi, value) => {
    if (lo > value) {
        return lo;
    } else if (hi < value) {
        return hi;
    } else {
        return value;
    }
});
