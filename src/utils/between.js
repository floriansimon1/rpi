module.exports = require('lodash').curry((lo, hi, value) => (
    lo <= value && hi >= value
));
