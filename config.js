//This is a sample.
//If a config.js is passed to the server, then it well overwrite everything in this file. So all the sample are easily overwritten.
//NOTE: It is recommended you write your own config, unless you want to throw all your data in the "sample_collection" =P
//SECURITY: PLEASE at least create your own admin_user and admin_pass. This can also be set using environment variables.

var config = {
    addOwner: true,                     //Every document well have an "_owner" attribute added that stores the _id of the owner

	mongo_url: 'mongodb://localhost:27017/testdatabase',
	mongo_url_env: 'MONGOLAB_URI',      //the environment variable to get the mongo url from. mongolab is what i use, so thats default.
	port: 1828,
	store_secret: 'omgasecret',

	route_prefix: '/api',
	auth_prefix: '/auth',

	admin_user: 'root',
	admin_pass: 'z',

    collections: {
        sample_collection: {
            //created: {auth: false},              //Default: All people, even ones that aren't registered or logged in, can create "sample_collection" articles
            edited: {
                auth: true,                 //only registered users can edit "sample_collection" articles
            },
            deleted: {
                auth: ['sample_admin'],     //only users in the group "sample_admin" can delete "sample_collection" articles
            },
            find: {
                auth: false,
                before: function(dbh, ctx, next) {
                    console.log('before finding a thing!', ctx, dbh.databaseName);
                    next();
                },
                after: function(dbh, ctx, next) {
                    console.log('after we found a thing!', ctx, dbh.databaseName);
                    if(ctx.result.length === 1) {
                        console.log('add timestamp if only one item!');
                        add_current_time(ctx.result[0]);
                    }
                    next();
                },
            },
            get: {
                after: function(dbh, ctx, next) {
                    //You could use dbh to attach related data to the ctx.
                    add_current_time(ctx.result);
                    next();
                },
            }
        },
    },
    groups: {
        sample_admin: ['sample_exec'],  //sample_admin can do everything sample_exec can do
        sample_exec: ['sample_manager'],//sample_exec can do everything sample_manager can do
    },

    google_scopes: ['https://www.googleapis.com/auth/plus.login'],
    google_id: false,
    google_secret: false,
    google_failure_redirect: function() {
        return config._oauth.google.auth();
    },

    upload_route: '/__file',
    upload_dir: '__uploads',
    file_route: '/__uploads',
    upload_path: function(folder) {
        folder = folder || '';
        return __dirname + '/' + config.upload_dir + '/' + folder;
    },


    //Warning: below are helper functions. This is what the server uses, so be wary changing them.
    _routes: {
        user: function() {
            return config.route_prefix + '/user';
        },
        users: function() {
            return config.route_prefix + '/users';
        },
        login: function() {
            return config.route_prefix + config.auth_prefix + '/login';
        },
        logout: function() {
            return config.route_prefix + config.auth_prefix + '/logout';
        },
        upload: function() {
            return config.route_prefix + config.file_route;
        },
        oauth: {
            google:  {
                auth: function() {
                    return config.route_prefix + config.auth_prefix + '/google';
                },
                callback: function() {
                    return config.route_prefix + config.auth_prefix + '/oauth2callback';
                },
                success: function() {
                    return config.route_prefix + config.auth_prefix + '/success';
                },
                failure: function() {
                    return config.route_prefix + config.auth_prefix + '/failure';
                },
            },
        },
        collection: function(collection) {
            return config.route_prefix + '/' + collection;
        },
    },
};

function add_current_time(result) {
    result.current_time = Date.now();
}

module.exports = config;
