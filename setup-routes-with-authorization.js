var MongoDB = require('feathers-mongodb');

var ForEach = require('./foreach');
var GetHooks = require('./get-hooks');

var SetupRoutesWithAuthorization = function(app, collections, config) {
    ForEach(collections, function(collectionConfig, collection) {
        console.log('Collection registered: ', collection);
        app.use(config.route_prefix + '/' + collection, MongoDB({
            connectionString: config.mongo_url,
            collection: collection,
        }));

        if(typeof collectionConfig == 'object') {
            var hooks = GetHooks(collectionConfig, config.mongo_url);
	        app.service(config.route_prefix + '/' + collection).before(hooks.before);
	        app.service(config.route_prefix + '/' + collection).after(hooks.after);
	    }
    });
};

module.exports = SetupRoutesWithAuthorization;
