var MongoDB = require('feathers-mongodb');

var ForEach = require('./foreach');
var GetBeforeHookSecurity = require('./get-before-hook-security');

var SetupRoutesWithAuthorization = function(app, collections, config) {
    ForEach(collections, function(authorization, collection) {
        console.log('Collection registered: ', collection);
        app.use(config.route_prefix + '/' + collection, MongoDB({
            connectionString: config.mongo_url,
            collection: collection,
        }));

        if(typeof authorization == 'object')
	        app.service(config.route_prefix + '/' + collection).before(GetBeforeHookSecurity(authorization));
    });
};

module.exports = SetupRoutesWithAuthorization;
