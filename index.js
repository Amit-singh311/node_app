/*
*Primary file for the api
*
 */
//Depenencies
var http          = require('http');
var https         = require('https');
var url           = require('url');
var stringDecoder = require('string_decoder').StringDecoder;
var config        = require('./config.js');
var fs            = require('fs');
var _data         = require('./lib/data');
var handlers      = require('./lib/handlers');
//console.log(_data);

//testing
// @TODO delete this
_data.delete('test', 'newfile', function(err) {
	console.log('this was an error ', err);
});

//The httpserver should respond with a string
var httpServer = http.createServer(function(req,res) {
     unifiedServer(req, res);
});
//Start the httpserver
httpServer.listen(config.httpPort, function() {
	console.log('The server is listening on port' +config.httpPort+ 'in'+ config.envName+'mode now');
});

var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')

};

//The httpsServer should respond with a string
var httpsServer = https.createServer(httpsServerOptions, function(req,res) {
     unifiedServer(req, res);
});
//Start the httpserver
httpsServer.listen(config.httpsPort, function() {
	console.log('The server is listening on port' +config.httpsPort+ 'in'+ config.envName+'mode now');
});

//all the commom logic for server lies within this block
var unifiedServer =  function(req, res) {
		//get the url and parse it
		var parseUrl = url.parse(req.url,true);
		//get the path
		var path = parseUrl.pathname;
		var trimmedPath = path.replace(/^\/+|\/+$/g,'');
		//getting the query string as an object
		var queryString = parseUrl.query;
		//getting the http method
		var method = req.method.toLowerCase();
		//getting the header and sending as object
		var headers = req.headers;

		//getting the payload if any
		var decoder = new stringDecoder('utf-8');
		var buffer = '';
		req.on('data', function(data) {
			buffer += decoder.write(data);
		});

		req.on('end', function() {
			buffer += decoder.end();
	        
	        //chose the handler for the request router
	        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] :handlers.notfound;
	        //data object
	        var data = {
	        	'trimmedPath' : trimmedPath,
	        	'queryString' : queryString,
	        	'method'      : method,
	        	'headers'     : headers,
	        	'payload'     : buffer  
	        };

	        chosenHandler(data, function(statuscode, payload) {
	        	//setting up the default status code
	        	statuscode = typeof(statuscode) == 'number' ? statuscode : 200;

	        	//setting up the default payload
	        	payload = typeof(payload) == 'object' ? payload : {};

	        	var payloadString = JSON.stringify(payload);

	        		//send the response
	        		res.setHeader('Content-Type', 'application/json');
	        		res.writeHead(statuscode);
	        	    res.end(payloadString);
	        	    
	        	    console.log('Returning this response', statuscode,payloadString);


	        });
			
		});
		

}


//Define a router
var router = {
	'ping' : handlers.ping
};