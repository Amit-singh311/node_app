/*
* Request handlers 
 */

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var config = require('./config');
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

handlers._users.get = function(data, callback) {
	var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;
	
	if (phone) {
		//get the token from the headers
		var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
		handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
			if (tokenIsValid) {
				_data.read('users', phone, function(err, data) {
					if (!err && data) {
						//remove the hashed passord
					    delete data.hashedPassword;
					    callback(200, data);

					} else {
						callback(404);
					}
				});

			} else {
				callback(403, {'Error' : 'Missing required token in header, or token in invalid'});
			}

		}); 
		

	} else {
		callback(400, {'Error' : 'Missing requirement fields'});
	}
};
//users -put
//required : phone
//optional : atleast one should be provided
handlers._users.put = function(data, callback) {
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	console.log(data.payload.phone.trim().length);
	//checking for the optinal fields
	var firstName    = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName     = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	
	var password     = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if (phone) {
		//error if nothing to update
		if (firstName || lastName || phone || password) {
			//get the token from the headers
		    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

		    handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
		    	if (tokenIsValid) {
		    		_data.read('users', phone, function(err, userData){
		    			if (!err && userData) {
		    				//we weill update it
		    				if (firstName) {
		    					userData.firstName = firstName;
		    				}
		    				if (lastName) {
		    					userData.lastName = lastName;
		    				}
		    				if (password) {
		    					userData.hashedPassword = helpers.hash(password); 
		    				}
		    				//store the new updates
		    				_data.update('users', phone, userData, function(err) {
		    					if (!err) {
		    						callback(200);
		    					} else {
		    						console.log(err);
		    						callback(500, {'Error': 'Internal Error'});
		    					}
		    				})
		    			} else {
		    				callback(400, {'Error': 'The specified user does not exist' });
		    			}
		    		});

		    	} else {
		    		callback(403, {'Error' : 'Missing required token in header, or token in invalid'});
		    	}
		    });
			

		} else {
			callback(400, {'Error': 'Missing fields'});
		}

	} else {
		callback(400, {'Error' : 'Phone is not valid or found'});
	}
};
//users -delete
handlers._users.delete = function(data, callback) {
	var phone = typeof(data.queryString.phone) == 'string' && data.queryString.phone.trim().length == 10 ? data.queryString.phone.trim() : false;
	
	if (phone) {
			//get the token from the headers
		    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

		    handlers._tokens.verifyToken(token, phone, function(tokenIsValid) {
		    	if (tokenIsValid) {
		    		_data.read('users', phone, function(err, data) {
		    			if (!err && data) {
		    				_data.delete('users', phone, function(err) {
		    					if (!err) {
		    						callback(200);
		    					} else {
		    						callback(500, {'Error' : 'Cannot delete the specified user'});
		    					}
		    				});

		    			} else {
		    				callback(404);
		    			}
		    		});
		    	} else {
		    		callback(403, {'Error' : 'Missing required token in header, or token in invalid'});
		    	}
		    });
		

	} else {
		callback(400, {'Error' : 'Missing requirement fields'});
	}
};

//token sub method handlers
handlers.tokens =  function(data, callback) {
	var acceptableMethods = ['get', 'post', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._tokens[data.method](data, callback); 
	} else {
		callback(405);
	}
};

//containers for tokens submethod
handlers._tokens = {};

//Tokens-post
//Required - phone and password
//Optional data - None
handlers._tokens.post = function(data, callback) {
	var phone        = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password     = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    if (phone) {
    	//read the users
    	_data.read('users', phone, function(err, userData) {    		
    		if (!err && userData) {
    			//check the password sent to the hashed password stored
              var hashedPassword = helpers.hash(password);
              if (hashedPassword == userData.hashedPassword) {
              	//create a new token for the user with random String and its valid for the one hour
              	var tokenID = helpers.createRandomString(20);
              	var expires = Date.now() + 1000 * 60 *60 ; //this will give one  hour
              	var tokenObject = {
              		'phone'   : phone,
              		'id'      : tokenID,
              		'expires' : expires
              	};
              	_data.create('tokens', tokenID, tokenObject, function(err) {
              		if (!err) {
              			callback(200, tokenObject);
              		} else {
              			callback(400, {'Error' : 'Cannot create token'});
              		}
              	});

              } else {
              	callback(400, {'Error' : 'the supplied password and the stored password does not match'});
              }
    		} else {
    			callback(404, {'Error': 'The specified user is not found'});
    		}    		
    	});

    } else {
    	callback(400, {'Error' : 'Missing required feilds'});
    }
};

//Tokens-get
//Required Data : id
//Optional Data : none
handlers._tokens.get = function(data, callback) {
	var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
	
	if (id) {
		//read token service
		_data.read('tokens', id, function(err, tokenData) {
			if (!err && tokenData) {
				
			    callback(200, tokenData);

			} else {
				callback(404);
			}
		});

	} else {
		callback(400, {'Error' : 'Missing requirement fields'});
	}
};

//Tokens-put
handlers._tokens.put = function(data, callback) {
	var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? true : false;
	var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
	if (id && extend) {
		//read the tokens collection
		_data.read('tokens', id, function(err, tokenData) {

			if (!err && tokenData) {
				//check for the token expiry
				if (tokenData.expires > Date.now()) {
					//set the expiration an hour form now
					tokenData.expires = Date.now() + 1000 * 60 * 60;
					//store the new update
				    _data.update('tokens', id, tokenData, function(err) {
				    	if (!err) {
				    		callback(200);
				    	} else {
				    		callback(500, {'Error' : 'Could not update the token\'s expiration'})
				    	}
				    });

				} else {
					callback(400, {'Error' : 'Token has already expired and cannot be extended'});
				}

			} else {
				callback(400, {'Error' : 'specified token does not exist'});
			}

		});
		

	} else {
		callback(400, {'Error' : 'Missing required field(s) or field(s) are invalid'});
	}
};

//Verify if a given token id is valid for a given user
handlers._tokens.verifyToken = function(id, phone, callback) {
	//look up for the token
	_data.read('tokens', id, function(err, tokenData) {
		if (!err && tokenData) {
			//check that the token is associated with the given phone number and token has not expired
		    if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
		    } else {
		    	callback(false);
		    }

		} else {
			callback(false);
		}
	});
};

//Tokens-delete
//reuired fields is id
//optional data is none
handlers._tokens.delete = function(data, callback) {
	var id = typeof(data.queryString.id) == 'string' && data.queryString.id.trim().length == 20 ? data.queryString.id.trim() : false;
	
	if (id) {
		//read token service
		_data.read('tokens', id, function(err, tokenData) {
			if (!err && tokenData) {
				_data.delete('tokens', id, function(err) {
					if (!err) {
                       callback(200);
					} else {
						callback(400, {'Error' : 'the specified token is not found'});
					}
				});
			} else {
				callback(404);
			}
		});

	} else {
		callback(400, {'Error' : 'Missing requirement fields'});
	}
};
//The submethod for the check service
handlers.checks =  function(data, callback) {
	var acceptableMethods = ['get', 'post', 'put', 'delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		handlers._checks[data.method](data, callback); 
	} else {
		callback(405);
	}
};

//Conatiner for checks
handlers._checks = {};

//checks -Post Method
//Required data - protocol, url, method, successCodes, timeoutSeconds
//Optional data - none
handlers._checks.post = function(data, callback) {
  //validate inputs
  var protocol      = typeof(data.payload.protocol) == 'string' && [ 'https', 'http'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  var url           = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  var method        = typeof(data.payload.method) == 'string' && [ 'post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  var successCodes  = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0  ? data.payload.successCodes : false;
  var timeoutSeconds  = typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
  		//get the token from the headers
  	    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
  	_data.read('tokens', token, function(err, tokenData) {
  		if (!err && tokenData) {
  			var userPhone = tokenData.phone;

  			//lookup for the users data
  			_data.read('users', userPhone, function(err, userData) {
  				if (!err && userData) {
  					var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                    //Verify that the user has less than  max-checks
                    if (userChecks.length < config.maxChecks) {
                    	//create a random checkID
                    	var checkId = helpers.createRandomString(20);
                        //create the check object and insert the user's phone
                    	var checkObject = {
                    		'id' : checkId,
                    		'userPhone' : userPhone,
                    		'protocol' : protocol,
                    		'url'      : url,
                    		'method'   : method,
                    		'successCodes' : successCodes,
                    		'timeoutSeconds': timeoutSeconds
                    	};
                    	//persist the check objects to the disks
                    	_data.create('checks', checkId, checkObject, function(err) {
                    		if (!err) {
                    			//Add the check id to the user object
                    			userData.checks = userChecks;
                    			userData.checks.push(checkId);
                    			//update the user data
                    			_data.update('users',userPhone, userData, function(err) {
                    				if (!err) {
                    					callback(200, checkObject);
                    				} else {
                    					callback(500, {'Error' : 'could not update the userObject with the new check id'});
                    				}
                    			});
                    			
                    		} else {
                    			callback(400, {'Error': 'checks could not be created '});
                    		}
                    	});

                    } else {
                    	callback(400, {'Error' : 'User has already excedded the limit'});
                    }
  				} else {
  					callback(403, {'Error' : 'userPhone not found'});
  				}

  			});

  		} else {
  			callback(403, {'Error' : 'token Not found'});
  		}
  	});
  	

  } else {
  	callback(400, {'Error' : 'Missing required inputs or inputs are invalid'});
  }
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