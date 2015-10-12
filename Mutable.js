'use strict';
var clone = require('lodash.clone');
// `lodash.assign` is similar to `_.extend`
var extend = require('lodash.assign');
var Container = require('./Container');
var Mutable = module.exports = function () {
    return Container.apply(this, arguments);
};
Mutable.prototype = extend({}, Container.prototype, {
    reset: function () {
        this.store = {};
    },
    add: function (key, val) {
        if (typeof key === 'object') {
            extend(this.store, key);
        } else {
            this.store[key] = typeof val === 'object' ? clone(val) : val;
        }
        return this;
    }
});
