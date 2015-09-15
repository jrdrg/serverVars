/* global describe:false, it:false, beforeEach:false, afterEach:false */

"use strict";

var assert = require('assert');
var Mutable = require('../Mutable');

describe('Mutable', function () {
    var serverVars;
    var test1;
    var test2;

    beforeEach(function () {
        serverVars = new Mutable({
            existing: 'foo'
        });
        test1 = { bar: 2 };
        test2 = { foo3: 3, foo4: { foo5: 5 } };
    });

    it('can add values to the store with an add method', function () {
        serverVars.add('foo1', 1);
        serverVars.add('foo2', test1);
        assert.equal(serverVars.get('foo1'), 1);

        test1.bar = 'foo';
        // objects are cloned when set on serverVars so foo2.bar should equal 2
        assert.equal(serverVars.get('foo2').bar, 2);

        serverVars.add(test2);
        assert.equal(serverVars.get('foo2').bar, 2);
        assert.equal(serverVars.get('foo3'), 3);
        assert.equal(serverVars.get('foo4.foo5'), 5);
    });
});
