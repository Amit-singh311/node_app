/*
* Library for storing and editing data
 */
//dependencies
var fs    = require('fs');
var path  = require('path');
//container for the data folder
var lib = {};

//Base directory for the data folder
lib.baseDir = path.join(__dirname,'./../.data/');

//write data to a file
lib.create =  function(dir, file, data, callback) {
	// Open the file for writing
	fs.open(lib.baseDir+dir+'/'+file+'.json','wx', function(err, fileDescriptor) {
		if(!err && fileDescriptor) {
			//convert file to string
			var stringData = JSON.stringify(data);
			// Write to file and close it
			fs.writeFile(fileDescriptor, stringData, function(err) {
				if (!err) {
					fs.close(fileDescriptor, function(err) {
                      if (!err) {
                      	callback(false);
                      } else {
                      	callback('Error closing new file');
                      }
					});
				} else {
					callback('error writing to the new file');
				}
			});
		} else {
			callback('could not create file , it may alredy exist');
		}
	});
};

//Read the data form the file
lib.read =  function(dir, file, callback) {
	fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', function(err,data) {
		callback(err, data);
	});
};

//Update the data inside a file
lib.update = function(dir, file, data, callback) {
	//open file for writing
	fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', function(err, fileDescriptor){
		if (!err && fileDescriptor) {
			//conver the data to string
			var stringData = JSON.stringify(data);
			//trucate the file
			fs.truncate(fileDescriptor, function(err){
				if(!err) {
					//write to the file and close it
					fs.writeFile(fileDescriptor,stringData, function(err) {
                       if (!err) {
                       	fs.close(fileDescriptor, function(err) {
                       		if (!err) {
                       			callback(false);
                       		} else {
                       			callback('error closing the file');
                       		}
                       	});

                       } else {
                       	callback('error writing to existing file')
                       }
					});
					
				} else {
					callback('error trucating file');
				}
			});
		} else {
			callback('could not open the file for updating , it may not exist yet');
		}
	});
};

//Delete the file
lib.delete = function(dir, file, callback) {
	//unlink the file
	fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err) {
		if (!err) {
			callback(false);
		} else {
			callback('error deleting the file');
		}
	});
};
//Export the lib
module.exports = lib;