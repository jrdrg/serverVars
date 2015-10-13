'use strict';
var Mutable = require('./Mutable');
var serverSideServerVars = require('./serverSide');
var clone = require('lodash.clone');
module.exports = function (req, res, next) {
    res.serverVars = res.locals.serverVars = new Mutable();
    res.serverVars.add(clone(serverSideServerVars.get())); // clone the app-wide serverVars
    next();
};
