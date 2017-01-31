'use strict';
var Mutable = require('./Mutable');
var serverSideServerVars = require('./serverSide');

module.exports = function (req, res, next) {
    res.serverVars = res.locals.serverVars = new Mutable();
    res.serverVars.add(Object.assign({}, serverSideServerVars.get())); // clone the app-wide serverVars
    next();
};
