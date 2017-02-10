'use strict';

var Container = require('./Container');
var Mutable = module.exports = function () {
    return Container.apply(this, arguments);
};
Mutable.prototype = Object.assign({}, Container.prototype, {
    reset: function () {
        this.store = {};
    },
    add: function (key, val) {
        if (typeof key === 'object') {
            Object.assign(this.store, key);
        } else {
            this.store[key] = (!Array.isArray(val) && typeof val === 'object') ? Object.assign({}, val) : val;
        }
        return this;
    }
});
