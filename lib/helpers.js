/*
*Helpers for various tasks
 */
//Dependencies
var crypto = require('crypto');
var config = require('./config')
//containers for all the helpers
var helpers = {};
helpers.hash = function(str) {
	if (typeof(str) == 'string' && str.length > 0) {
		var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
		return hash;

	} else {
		return false;
	}
};

//parse json to object without throwing an error
helpers.parseJsonToObject =  function(str) {
	try {
		var obj = JSON.parse(str);
		return obj;
	} catch(e) {
		return {};
	}

};
//export the helpers
module.exports = helpers;