const _ = require("lodash");

/*
* Takes a hash of functions indexed by function name and makes those
* functions methods of the type identified by Constructor by passing
* the functions the value of this as its first argument.
*/
module.exports = (Constructor, functionsByName) => {
    _.forEach(functions.forEach((f, functionName) => {
        Constructor.prototype[functionName] = function () {
            return f.apply([this].concat(arguments));
        };
    });
};
