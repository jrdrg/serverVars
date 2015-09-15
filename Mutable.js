var _ = require('underscore');
var Container = require('./Container');
var Mutable = module.exports = function () {
    return Container.apply(this, arguments);
};
Mutable.prototype = _.extend({}, Container.prototype, {
    reset: function () {
        this.store = {};
    },
    add: function (key, val) {
        if (typeof key === 'object') {
            _.extend(this.store, key);
        } else {
            this.store[key] = typeof val === 'object' ? _.clone(val) : val;
        }
        return this;
    }
});
