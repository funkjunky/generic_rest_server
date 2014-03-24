'use strict';

var FileSystem = require('fs')
var Express = require('express');
var Http = require('http');
var Mongo = require('mongodb');

//create the server

var app = Express();
var server = Http.createServer(app);
var db = Mongo.MongoClient;
var dbh;

var config = {};

app.use(Express.bodyParser());

app.configure(function() {
	//Config file
	if(FileSystem.existsSync('restconfig.json'))
		config = require('./restconfig.json');

	//command line and environment variables
	//TODO: there should be a more elegant way to do this. Like some kind of greedy iteration.
	if(process.argv[2]) config.mongo_url = process.argv[2];
	if(process.argv[3]) config.database = process.argv[3];
	if(process.argv[4]) config.port = process.argv[4];
	else if(process.env.port) config.port = process.env.port;

	//defaults
	if(!config.mongo_url) config.mongo_url = 'mongodb://localhost:27017/';
	if(!config.database) config.database = 'restful_test';
	if(!config.port) config.port = 1818;

	//set the settings
	app.set('port', config.port);
	app.set('mongo_db_url', config.mongo_url + config.database);
});

// Prepare the mongo connection
db.connect(app.get('mongo_db_url'), function(err, dbHandle) {
	if(!err) {
		console.log('Connected to MongoDB: ' + app.get('mongo_db_url'));
		dbh = dbHandle;
	} else
		console.log('Mongo Connection failed with the following error:', err);
});

// POST - Creating new posts //
app.post('/:collection', function(req, res) {
	var collection = dbh.collection(req.params.collection);
	if(collection)
		collection.insert(req.body, function(err, docs) {
			if(!err)
				res.send(200, 'Successfully create the record: ' + JSON.stringify(req.body, null, '\t'));
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

app.put('/:collection', function(req, res) {
	res.send(200, 'EDIT on collection ' + req.params.collection);
});

app.delete('/:collection', function(req, res) {
	res.send(200, 'DELETE on collection ' + req.params.collection);
});

server.listen(app.get('port'));
console.log('Generic Restful Server now listening on port ' + app.get('port'));
