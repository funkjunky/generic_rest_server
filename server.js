'use strict';

var FileSystem = require('fs')
var Express = require('express');
var Http = require('http');
var Mongo = require('mongodb');
var BodyParser = require('body-parser');
var ObjectID = Mongo.ObjectID;

//create the server

var app = Express();
var server = Http.createServer(app);
var db = Mongo.MongoClient;
var dbh;

var config = {};

// Allowing CORS middleware //
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	next();
};
// //////////////////////// //

	//Config file
	if(FileSystem.existsSync('restconfig.json'))
		config = require('./restconfig.json');

	//command line and environment variables
	//TODO: there should be a more elegant way to do this. Like some kind of greedy iteration.
	if(process.argv[2]) config.mongo_url = process.argv[2];
	else if(process.env.MONGOLAB_URI) config.mongo_url = process.env.MONGOLAB_URI;
	if(process.argv[3]) config.database = process.argv[3];
	if(process.argv[4]) config.port = process.argv[4];
	else if(process.env.PORT) config.port = process.env.PORT;

	//defaults
	if(!config.mongo_url) config.mongo_url = 'mongodb://localhost:27017/';
	if(!config.database) config.database = 'heroku_app34883601';
	if(!config.port) config.port = 1828;

	//set the settings
	app.set('port', config.port);
	app.set('mongo_db_url', config.mongo_url);

	//middleware
	app.use(BodyParser);
	app.use(allowCrossDomain);

// Prepare the mongo connection
db.connect(app.get('mongo_db_url'), function(err, dbHandle) {
	if(!err) {
		console.log('Connected to MongoDB: ' + app.get('mongo_db_url'));
		dbh = dbHandle;
	} else
		console.log('Mongo Connection failed with the following error:', err);
});

// OPTIONS for cross domain crap
app.options('*', function(req, res) {
	res.send(200);
});

// POST - Creating new posts //
app.post('/:collection', function(req, res) {
	var collection = dbh.collection(req.params.collection);
	if(collection)
		collection.insert(req.body, function(err, docs) {
			if(!err)
				res.send(200, 'Successfully created the record: ' + JSON.stringify(req.body, null, '\t'));
			else
				res.send(500, 'An error occured: ' + JSON.stringify(err, null, '\t'));
		});
	else
		res.send(500, 'Could not instantiate collection object');
});


app.get('/:collection', function(req, res) {
	var collection = dbh.collection(req.params.collection);
	if(collection)
		collection.find(req.query, {}, function(err, docs) {
			if(!err)
				docs.toArray(function(err, results) {
					res.send(200, JSON.stringify(results));
				});
			else
				res.send(500, 'An error occured: ' + JSON.stringify(err, null, '\t'));
		});
	else
		res.send(500, 'Could not instantiate collection object');
});

app.delete('/:collection', function(req, res) {
	var collection = dbh.collection(req.params.collection);
	if(collection)
		collection.remove(req.body, function(err) {
			if(!err)
				res.send(200, 'Delete The document with the parameters:\n' + JSON.stringify(req.body, null, '\t'));
			else
				res.send(500, 'An error occured: ' + JSON.stringify(err, null, '\t'));
		});
	else
		res.send(500, 'Could not instantiate collection object');
});

app.put('/:collection', function(req, res) {
	var _id = ObjectID(req.body._id);
	delete req.body['_id'];
	var collection = dbh.collection(req.params.collection);
	if(collection)
		collection.update({_id: _id}, {$set: req.body}, function(err) {
			if(!err)
				res.send(200, 'Updated "' + _id + '" to: ' + JSON.stringify(req.body, null, '\t'));
			else
				res.send(500, 'An error occured: ' + JSON.stringify(err, null, '\t'));
		});
	else
		res.send(500, 'Could not instantiate collection object');
});

app.put('/__file/:folder', function(req, res) {
	var files = req.files;
	for(var filename in files)
		FileSystem.readFile(files[filename].path, function(err, data) {
			var newDir = '/__uploads/' + req.params.folder + '/';
			var newPath = newDir + files[filename].name;
			if(!FileSystem.existsSync(__dirname + '/uploads'))
				FileSystem.mkdir(__dirname + '/uploads');
			if(!FileSystem.existsSync(__dirname + newDir))
				FileSystem.mkdir(__dirname + newDir);
			FileSystem.writeFile(__dirname + newPath, data, function(err) {
				if(err) {
					console.log('Upload failed:', err);
					res.send(500, 'File failed to save.');
				}
				else
					res.send(200, JSON.stringify({url: newPath.replace('#','%23'), type: files[filename].type}));
					
			});
		});
});

app.use('/__uploads', Express.static(__dirname + '/__uploads'));

server.listen(app.get('port'));
console.log('Generic Restful Server now listening on port ' + app.get('port'));
