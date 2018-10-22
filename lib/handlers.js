/*
* Request handlers 
 */

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');
//containers for handlers
var handlers = {};
//users handlers
handlers.users =  function(data, callback) {
	var acceptableMethods = ['get', 'post', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback); 
	} else {
		callback(405);
	}
};

//containers for the user sub methods
handlers._users = {};
//users -post
//required_data = firstname, lastname, phone number , email address, tos agreement
//optional_data = none
handlers._users.post = function(data, callback) {
	//check all the required fields are filled out.
	var firstName    = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName     = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone        = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password     = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if (firstName && lastName && phone && tosAgreement) {
		//Making sure that user dies not already exists
		_data.read('users', phone, function(err, data) {
			if (err) {
				//hash the password
				var hashedPassword = helpers.hash(password);
				console.log(hashedPassword);
				//create user object
				
					var userObject = {
						'firstName' : firstName,
						'lastName'  : lastName,
						'phone'     : phone,
						'hashedPassword' :hashedPassword,
						'tosAgreement'  : true 
					};
					//store the user
					_data.create('users', phone, userObject, function(err, data) {
						if (!err) {
							callback(200);
						} else {
							console.log(err);
							callback(500, {'error' : 'could not create a new user'});
						}
					});				
			} else {
				//users already exists
				callback(400, {'Error' : 'A User with that phone numbe already exits'});
			}			
		});
	} else {
		callback(400, {'Error' : 'Missing requirement fields'});
	}

};

//users -get
//required data : phone
//Optinal data : none
//@Todo Only let authenticated users access their Object
handlers._users.get = function(data, callback) {
	var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim() == 10 ? data.queryString.phone.trim() : false;
	if (phone) {
		_data.read('users', phone, function(err, data) {
			if (!err && data) {
				//remove the hashed passord
			    delete data.hashedPassword;
			    callback(200, data);

			} else {
				callback(404);
			}
		})

	} else {
		callback(400, {'Error' : 'Missing requirement fields'});
	}

};
//users -put
handlers._users.put = function(data, callback) {

};
//users -delete
handlers._users.delete = function(data, callback) {

};
handlers.ping = function(data, callback) {
 //callback a status code 
   callback(200);
};

handlers.notfound = function(data, callback) {
  //callback for data not found
   callback(404);
};



//export the handlers
module.exports = handlers;