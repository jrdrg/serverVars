/* global describe:false, it:false, beforeEach:false, afterEach:false */

"use strict";

var Container = require('../Container');
var assert = require('assert');

describe('Container', function () {
    var serverVars;
    beforeEach(function () {
        serverVars = new Container({
            thomas: 'foo',
            test2: {
                test3: 3
            }
        });
    });
    it('has a `get` method that retrieves keys', function () {
        assert.equal(serverVars.get('test2.test3'), 3);
    });
    describe('buildLayer', function () {
        var origServerVarsGet;
        var globalSpyOn;
        before(function () {
            globalSpyOn = global.spyOn;
            global.spyOn = function (obj, fn) {
                var objfn = obj[fn];
                return {
                    and: { callFake: function (fake) {
                        obj[fn] = function () {
                            return fake.apply(this, arguments);
                        };
                    }}
                };
            };
        });
        after(function () {
            global.spyOn = globalSpyOn;
        });
        it('should defer to the real serverVars when the passthrough option is true', function () {
            var layeredGet = serverVars.buildLayer({
                hallock: 'bar'
            }, {
                passthrough: true
            });
            assert.equal(layeredGet('thomas'), 'foo');
            assert.equal(layeredGet('hallock'), 'bar');
            assert.equal(serverVars.get('thomas'), 'foo');
            assert.equal(serverVars.get('hallock'), undefined);
            assert.equal(serverVars.get('test2.test3'), 3);
            assert.equal(layeredGet('test2.test3'), 3);
        });
        it('should work like get', function () {
            var layeredGet = serverVars.buildLayer({
                hallock: 'bar'
            });
            assert.equal(layeredGet('hallock'), 'bar');
        })
        it('should layer on top of the fake function inside of the spy', function () {
            serverVars.jasmineFakeGet({
                foo: 'bar'
            });
            assert.equal(serverVars.get('foo'), 'bar');
            assert.equal(serverVars.get('thomas'), undefined);
            serverVars.jasmineFakeGet({
                thomas: 'hallock'
            });
            assert.equal(serverVars.get('foo'), 'bar');
            assert.equal(serverVars.get('thomas'), 'hallock');
        });
    });
});
