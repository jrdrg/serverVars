var Mutable = require('./Mutable');
var serverSideServerVars = require('./serverSide');
var _ = require('underscore');
module.exports = function (req, res, next) {
    res.serverVars = res.locals.serverVars = new Mutable();
    res.serverVars.add(_.clone(serverSideServerVars.get())); // clone the app-wide serverVars
    next();
};
