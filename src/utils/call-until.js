"use strict";

/*
* Keeps calling the function until the condition is
* fullfilled, then returns the result of that function.
*/
module.exports = (f, condition) => {
    let result;

    while (!condition(result = f()));

    return result;
};
