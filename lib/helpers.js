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

//create a random alpahnumeric characters of given length
helpers.createRandomString = function(strLength) {
	var strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;

	if (strLength) {
		var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		var str = '';
		for(i = 1; i<= strLength; i++) {
			//generate random charaters form  the possible charaters
			var randomChracters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
			//append the caharaters to the string
			str += randomChracters;
		}
        return str;
	} else {
		return false;
	}
}


//export the helpers
module.exports = helpers;