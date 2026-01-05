"use strict";

module.exports = function () {
  return new Date(new Date().toLocaleString("en-US", {
    timeZone: "Asia/Manila"
  }));
};