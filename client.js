/* global require:false, module:true */
"use strict";

var root = 'undefined' === typeof window ? global : window;
var SV = module.exports = root.__SERVER_VARS__ = root.__SERVER_VARS__ || {};
var Container = require('./Container');
var container = new Container(SV);
SV.get = function () {
    // container.get may be swapped by a jasmine spy, so we can't just set SV.get to container.get.bind(container) here.
    return container.get.apply(container, arguments);
};
SV._api = container;
SV._data = SV;
