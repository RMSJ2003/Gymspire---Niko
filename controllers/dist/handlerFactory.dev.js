"use strict";

var catchAsync = require('./../utils/catchAsync');

var APIFeatures = require('../utils/apiFeatures');

var AppError = require('./../utils/appError');

exports.deleteOne = function (Model) {
  return catchAsync(function _callee(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(Model.findByIdAndDelete(req.params.id));

          case 2:
            doc = _context.sent;

            if (doc) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", next(new AppError('No document found with that ID', 404)));

          case 5:
            res.status(204).json({
              status: 'success',
              data: null
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};

exports.deleteAll = function (Model) {
  return catchAsync(function _callee2(req, res, next) {
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(Model.deleteMany({}));

          case 2:
            res.status(204).json({
              status: 'success',
              data: null
            });

          case 3:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
};

exports.updateOne = function (Model) {
  return catchAsync(function _callee3(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(Model.findByIdAndUpdate(req.params.id, req.body, {
              "new": true,
              runValidators: true
            }));

          case 2:
            doc = _context3.sent;

            if (doc) {
              _context3.next = 5;
              break;
            }

            return _context3.abrupt("return", next(new AppError('No document found with that ID', 404)));

          case 5:
            res.status(200).json({
              status: 'success',
              data: {
                doc: doc
              }
            });

          case 6:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
};

exports.getOne = function (Model) {
  return catchAsync(function _callee4(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return regeneratorRuntime.awrap(Model.findById(req.params.id));

          case 2:
            doc = _context4.sent;

            if (doc) {
              _context4.next = 5;
              break;
            }

            return _context4.abrupt("return", next(new AppError('No document found with that ID', 404)));

          case 5:
            res.status(200).json({
              status: 'success',
              data: doc
            });

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
};

exports.getAll = function (Model) {
  return catchAsync(function _callee5(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(Model.find());

          case 2:
            doc = _context5.sent;
            res.status(200).json({
              status: 'success',
              results: doc.length,
              data: {
                data: doc
              }
            });

          case 4:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
};