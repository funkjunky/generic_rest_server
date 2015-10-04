'use strict';

//External Libraries
var Feathers = require('feathers');
var BodyParser = require('body-parser');
var Hooks = require('feathers-hooks');
var FeathersPassport = require('feathers-passport');

//Helper functions for setting up server
var UserService = require('./user-service');
var GetConfigs = require('./get-configs');
var AllowCrossDomain = require('./allow-cross-domain');
var PassportConfigs = require('./passport-configs');
var GetPassport = require('./get-passport');
var SetupAuthentication = require('./setup-authentication');
var SetupRoutesWithAuthorization = require('./setup-routes-with-authorization');
var SetupUploadAndFileAccess = require('./setup-upload-and-file-access');
var IoConstants = require('./io-constants');


//get app
var app = Feathers();

//get configurations and services
var config = GetConfigs(process.argv[2], './config.js', process);
var userService = UserService(config.db, config.admin_user, config.admin_pass);
var passport = GetPassport(userService);

//setup middleware
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(AllowCrossDomain); //Allowing CORS middleware

//configure app
app
    //REST server
	.configure(Feathers.rest())
	//Socket server
	.configure(Feathers.socketio(function(io) {
	    io.on(IoConstants.listen.connection, function(socket) {
	        console.log('connected!!');
	    });
	}))
	//Prepare passport hooks
	.configure(Hooks())
	.configure(FeathersPassport(PassportConfigs(passport, userService, config)));

SetupAuthentication(app, userService, passport, config);

SetupRoutesWithAuthorization(app, config.collections, config);

SetupUploadAndFileAccess(app, config);


app.listen(config.port);
console.log('Database Connection: ', config.mongo_url);
console.log('collections: ', Object.keys(config.collections));
console.log('Generic Restful Server now listening on port ' + config.port);
