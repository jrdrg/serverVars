/* global describe:false, it:false, beforeEach:false, afterEach:false */
/**
 * Created by timwhidden
 * Date: 4/29/15
 * Time: 5:57:23PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */

"use strict";

var assert = require('assert');
var express = require('express');
var supertest = require('supertest');

describe('serverVars works', function () {

    describe('...on the server', function () {
        var serverVars;
        var test1 = { bar: 2 };
        var test2 = { foo3: 3, foo4: { foo5: 5 } };

        beforeEach(function () {
            serverVars = require('../');
        });

        afterEach(function() {
            // reset the module
            serverVars = null;
            test1.bar = 2;
        });

        it('sets & gets server vars', function () {
            serverVars.add('foo1', 1);
            serverVars.add('foo2', test1);
            assert.ok(serverVars.get('foo1') === 1);

            test1.bar = 'foo';
            // objects are cloned when set on serverVars so foo2.bar should equal 2
            assert.ok(serverVars.get('foo2').bar === 2);

            serverVars.add(test2);
            assert.ok(serverVars.get('foo2').bar === 2);
            assert.ok(serverVars.get('foo3') === 3);
            assert.ok(serverVars.get('foo4.foo5') === 5);
        });

        describe('middleware', function () {
            var app;

            beforeEach(function () {
                serverVars = require('../');
                app = express();
                app.use(serverVars.middleware);
            });

            afterEach(function () {
                app = null;
            });

            it('makes `serverVars` available to downstream middleware', function (done) {
                var testVal = 'mw1';

                app.use(function(req, res, next) {
                    res.locals.serverVars.add('localsVar', testVal);
                    next();
                });
                app.get('/test', function (req, res) {
                    res.status(200).send(res.locals.serverVars.get('localsVar'));
                });
                supertest(app)
                    .get('/test')
                    .expect(testVal)
                    .expect(200, done);
            });

            it('generates the proper script tag', function (done) {
                // All vars set on server will be present (e.g.: foo1: 1, etc)
                // vars set by other middleware on locals will not be present
                var response = '<script type="text/javascript">window.__SERVER_VARS__ = {"foo1":1,"foo2":{"bar":2},"foo3":3,"foo4":{"foo5":5},"mw":"mw2"};</script>';

                app.use(function(req, res, next) {
                    res.locals.serverVars.add('mw', 'mw2');
                    next();
                });
                app.get('/test', function (req, res) {
                    res.status(200).send(res.locals.serverVars.inject());
                });
                supertest(app)
                    .get('/test')
                    .expect(response)
                    .expect(200, done);
            });
        });
    });

    describe('...on the client', function () {
        var serverVars;

        beforeEach(function () {
            // mock bootstrapped serverVars
            global.window = { __SERVER_VARS__: { test1: 1, test2: { test3: 3 } } };
            // need to clear the module's cache
            // it was instantiated as if on the server already
            // this resets it so that it will be instantiated as if on the client
            delete require.cache[require.resolve('../')];
            serverVars = require('../');
        });

        afterEach(function () {
            serverVars = null;
        });

        it('errors if attempt to set', function () {
            assert.throws(function () {
                serverVars.add('foo', 'bar');
            }, Error);
        });

        it('allows normal accessors', function () {
            assert.ok(serverVars.test1 === 1);
        });

        it('has a `get` method that retrieves keys', function () {
            assert.ok(serverVars.get('test2.test3') === 3);
        });

    });

});
