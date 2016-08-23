"use strict";

const Maybe = require("data.maybe");

module.exports = (value, evaluatedCondition) => (
    (evaluatedCondition ? Maybe.of(value) : Maybe.Nothing())
    .map(() => value)
);
