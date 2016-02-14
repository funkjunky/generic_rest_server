#!/usr/bin/env node

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
var LocalUploadAndFileAccess = require('./local-upload-and-file-access');
var S3UploadAndFileAccess = require('./s3-upload-and-file-access');


//get app
var app = Feathers();

//get configurations and services
var config = GetConfigs(process.argv[2], __dirname + '/config.js', process);
var userService = UserService(config.mongo_url, config.admin_user, config.admin_pass);
var passport = GetPassport(userService, config);

//setup middleware
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(AllowCrossDomain); //Allowing CORS middleware

//configure app
app
    //REST server
	.configure(Feathers.rest())
	//Socket server
	.configure(Feathers.socketio())
	//Prepare passport hooks
	.configure(Hooks())
	.configure(FeathersPassport(PassportConfigs(passport, userService, config)));

SetupAuthentication(app, userService, passport, config);

SetupRoutesWithAuthorization(app, config.collections, config);

if(process.env.UPLOADER == 's3')
    S3UploadAndFileAccess(app, config);
else
    LocalUploadAndFileAccess(app, config);

app.use(function(req, res, next) {
    res.status(404).send('API url not found.\n');
});


app.listen(config.port);
console.log('Database Connection: ', config.mongo_url);
console.log('collections: ', Object.keys(config.collections));
//TODO: read the NPM to set this version
console.log('Generic Restful Server v0.5.1 is now listening on port ' + config.port);
