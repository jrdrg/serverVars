var express = require('express');
// var Mutable = require('../Mutable');
var middleware = require('../middleware');
var supertest = require('supertest');
var serverSide = require('../serverSide');

describe('middleware', function () {
    var app;
    beforeEach(function () {
        serverSide.reset();
        serverSide.add("foo1", 1);
        serverSide.add("foo2", {bar: 2});
        serverSide.add("foo3", 3);
        serverSide.add("foo4", {foo5: 5});
        app = express();
        app.use(middleware);
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
        // pending feedback from tim on middleware global servervars. TODO

        // All vars set on server will be present (e.g.: foo1: 1, etc)
        // vars set by other middleware on locals will not be present
        var response = '<script type="text/javascript">window.__SERVER_VARS__ = {"foo1":1,"foo2":{"bar":2},"foo3":3,"foo4":{"foo5":5},"mw":"mw2"};</script>';

        app.use(function(req, res, next) {
            res.locals.serverVars.add('mw', 'mw2');
            next();
        });
        app.get('/test', function (req, res) {
            res.status(200).send(res.locals.serverVars.getInjector());
        });
        supertest(app)
            .get('/test')
            .expect(response)
            .expect(200, done);
    });
});
