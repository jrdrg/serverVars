/* global describe:false, it:false, beforeEach:false, afterEach:false */
/**
 * Created by timwhidden
 * Date: 4/29/15
 * Time: 5:57:23PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */

"use strict";
var ServerVarsContainer = require('../Container');
var assert = require('assert');
describe('serverVars client side', function () {
    var serverVars;
    var originalGlobalWindow;
    before(function () {
        originalGlobalWindow = global.window;
    });
    after(function () {
        global.window = originalGlobalWindow;
    });
    beforeEach(function () {
        // mock bootstrapped serverVars
        delete require.cache[require.resolve('../client')];
        global.window = { __SERVER_VARS__: { test1: 1, test2: { test3: 3 } } };
        serverVars = require('../client');
    });
    it('exports global.window.__SERVER_VARS__', function () {
        assert.equal(global.window.__SERVER_VARS__, serverVars);
    });
    it('exposes container object as SV._api', function () {
        assert.ok(serverVars._api instanceof ServerVarsContainer);
    });
    it('has a get method that defers to values in window.__SERVER_VARS__', function () {
        assert.equal(serverVars.get('test1'), 1);
        assert.equal(serverVars.get('test2.test3'), 3);
    });
});
