'use strict';

var get = require('lodash.get');
var Container = module.exports = function (store) {
    this.store = store || {};
};
var mockDataNotFound = '__mock_data_not_found__';

function result(obj, prop) {
    if (!obj) {
        return
    } else if (typeof obj[prop] === 'function') {
        return obj[prop]();
    }
    return obj[prop];
}

Container.prototype = {
    get: function(key) {
        if (key) {
            return get(this.store, key);
        }
        return Object.assign({}, this.store);
    },

    // buildLayer returns a function suitable for passing to spyOn(fooo, 'bar').and.callFake that defers initially to a fake layer of serverVars on top of the existing serverVars
    //   var getWithMyData = serverVars.buildLayer({thomas: 45});
    //   spyOn(serverVars, 'get').and.callFake(getWithMyData);
    //   expect(serverVars.get('thomas')).toEqual(45);
    // caveat – this will not work:
    //   spyOn(serverVars, 'get').and.callFake(serverVars.buildLayer({thomas: 45}));
    // because the call to buildLayer is invoked after serverVars.get is repalced with the spy.
    buildLayer: function (dataLayer, options) {
        var thisGet = this.get;
        var passthrough;
        options = Object.assign({
            passthrough: false
        }, options);
        return function (key) {
            var mockValue;
            mockValue = get(dataLayer, key, mockDataNotFound);
            if (mockDataNotFound !== mockValue) {
                return mockValue;
            }
            if (!options.passthrough) {
                return;
            }
            if ("function" === typeof options.passthrough) {
                passthrough = options.passthrough;
            } else {
                passthrough = thisGet;
            }
            return passthrough.apply(this, arguments);
        }.bind(this);
    },
    // installs a fake get method on server vars if serverVars.get.isSpy is falsy
    // proxies the spy through to this.get._spyTarget
    // sets this.get_spyTarget to new fake getter with buildLayer that passes through to the prior version of this.get._spyTarget
    // This method is useful for building up layers of fake data for serverVars.get in jasmine specs
    jasmineFakeGet: function (dataLayer, options) {
        options = Object.assign({
            passthrough: this.get._spyTarget || result(options, 'passthrough')
        }, options);
        var thisSV = this;
        if (undefined === global.spyOn) {
            console.error('jasmineFakeGet requires jasmine globals');
        }
        if (!this.get.isSpy) {
            spyOn(this, 'get').and.callFake(function () {
                return thisSV.get._spyTarget.apply(this, arguments);
            });
            thisSV.get.isSpy = true;
        }
        this.get._spyTarget = this.buildLayer(dataLayer, options);
        return this;
    },
    getInjector: function () {
        return '<script type="text/javascript">' +
            'window.__SERVER_VARS__ = ' +
                // safely embed JSON within HTML
                // see http://stackoverflow.com/a/4180424/266795
            JSON.stringify(this.get())
                .replace(/</g, '\\u003c')
                .replace(/-->/g, '--\\>')
                .replace(/\u2028/g, '\\u2028')
                .replace(/\u2029/g, '\\u2029') +
            ';</script>';
    }
};
Container.prototype.inject = Container.prototype.getInjector; // for use inside of twig templates: https://github.com/1stdibs/serverVars/pull/2#issuecomment-140472031
