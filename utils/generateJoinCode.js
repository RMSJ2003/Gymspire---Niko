const crypto = require('crypto');

module.exports = function generateJoinCode(length = 6) {
    return crypto
        .randomBytes(Math.ceil(length/2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
};