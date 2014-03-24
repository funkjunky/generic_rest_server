'use strict';

var FileSystem = require('fs')
var Express = require('express');
var Http = require('http');

//create the server

var app = Express();
var server = Http.createServer(app);

app.configure(function() {
	var config = {};

	//Config file
	if(FileSystem.existsSync('restconfig.json'))
		config = require('restconfig.json');

	//command line and environment variables
	if(process.argv[2]) config.database = process.argv[2];
	if(process.argv[3]) config.port = process.argv[3];
	else if(process.env.port) config.port = process.env.port;

	//defaults
	if(!config.database) config.database = 'restful_test';
	if(!config.port) config.port = 1818;
	app.set('port', config.port);
});

server.listen(app.get('port'));
console.log('Generic Restful Server now listening on port ' + app.get('port'));
