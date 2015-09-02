/* global require:false, module:true */
/**
 * Created by timwhidden
 * Date: 5/7/15
 * Time: 7:12:06PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */
"use strict";

var _ = require('underscore');
var findNamespaceValue = require('find-namespace-value');
var realClientServerVars;
var clientServerVars;

var ServerVars = function () {
    this._svStack = [{}];
};
ServerVars.prototype = {
    add: function (key, val) {
        if (typeof key === 'object') {
            _.extend(this.getStore(), key);
        } else {
            this.getStore()[key] = typeof val === 'object' ? _.clone(val) : val;
        }
    },
    get: function(key) {
        var svValue;
        var i;
        if (!key) {
            return _.clone(_.extend.apply(_, [{}].concat(this._svStack)));
        }
        for(i=this._svStack.length - 1; i >= 0; --i) {
            if (svValue = findNamespaceValue(key, this._svStack[i])) {
                return svValue;
            }
        }
    },
    getStore: function () {
        return this._svStack[this._svStack.length - 1];
    },
    push: function () {
        return Array.prototype.push.apply(this._svStack, arguments);
    },
    pop: function () {
        return Array.prototype.pop.apply(this._svStack, arguments);
    },
    inject: function () {
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

var serverVars = new ServerVars();

serverVars.middleware = function (req, res, next) {
    res.serverVars = res.locals.serverVars = new ServerVars();
    res.serverVars.add(_.clone(serverVars.get())); // get a copy of app-wide serverVars
    next();
};

// on the client, this module exports the bootstrapped serverVars
if (typeof window !== 'undefined' && window.__SERVER_VARS__) {
    realClientServerVars = new ServerVars();
    clientServerVars = window.__SERVER_VARS__;
    realClientServerVars.push(clientServerVars);
    _.each(_.omit(ServerVars.prototype, 'add', 'inject'), function (f, fname) {
        if (ServerVars.prototype.hasOwnProperty(fname)) {
            clientServerVars[fname] = f.bind(realClientServerVars);
        }
    });
    serverVars = clientServerVars;
}

module.exports = serverVars;
