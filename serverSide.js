// exports a module-global instance of an mutable that can be used to build up the global servervars
// used in the middleware module as the global serverVars instance

var Mutable = require('./Mutable');
module.exports = new Mutable();
