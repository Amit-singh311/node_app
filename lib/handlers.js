/*
* Request handlers 
 */

//Dependencies
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
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

};
//users -get
handlers._users.get = function(data, callback) {

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