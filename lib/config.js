/*
* create and exports configuration variables
 */

var environments  = {};
//stagging default environment
environments.stagging = {
	'httpPort' : 3000,
	'httpsPort': 3001,
	'envName' : 'stagging',
	'hashingSecret' : 'thisisasecret',
	'maxChecks' : 5  
};

//production environment
environments.production = {
	'httpPort' : 5000,
	'httpsPort': 5001,
	'envName': 'production',
	'hashingSecret' : 'thisisasecret',
	'maxChecks' : 5
};

//Determine which environemnts was passes as the command line arguments
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

//check if the type of enviroments is present if not pass the stagging as default.
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.stagging;

module.exports = environmentToExport;
