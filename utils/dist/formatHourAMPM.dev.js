"use strict";

module.exports = function (hour24) {
  var period = hour24 >= 12 ? 'PM' : 'AM';
  var hour12 = hour24 % 12 || 12; // convert 0 -> 12

  return "".concat(hour12, ":00 ").concat(period);
};