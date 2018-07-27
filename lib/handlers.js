var handlers = {};
handlers.ping = function(data, callback) {
 //callback a status code 
   callback(200);
};

handlers.notfound = function(data, callback) {
  //callback for data not found
   callback(404);
};