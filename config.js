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

	admin_user: 'root',
	admin_pass: 'z',

    collections: {
        sample_collection: {
            created: false,              //All people, even ones that aren't registered or logged in, can create "sample_collection" articles
            edited: true,                 //only registered users can edit "sample_collection" articles
            deleted: 'sample_admin',     //only users in the group "sample_admin" can delete "sample_collection" articles
        },
    },
    groups: {
        sample_admin: ['sample_exec'],  //sample_admin can do everything sample_exec can do
        sample_exec: ['sample_manager'],//sample_exec can do everything sample_manager can do
    },

    users_route: '/users',
    login_route: '/login',

    upload_route: '/__file',
    upload_dir: '__uploads',
    file_route: '/__uploads',
};

module.exports = config;
