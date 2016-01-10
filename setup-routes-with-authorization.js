var MongoDB = require('feathers-mongodb');

var ForEach = require('./foreach');
var GetHooks = require('./get-hooks');

var SetupRoutesWithAuthorization = function(app, collections, config) {
    ForEach(collections, function(collectionConfig, collection) {
        console.log('Collection registered: ', collection);
        //console.log('the mongourl: ', config.mongo_url);
        app.use(config._routes.collection(collection), MongoDB({
            connectionString: config.mongo_url,
            collection: collection,
        }));

        if(typeof collectionConfig == 'object') {
            var hooks = GetHooks(collectionConfig, config.mongo_url);
	        app.service(config._routes.collection(collection)).before(hooks.before);
	        app.service(config._routes.collection(collection)).after(hooks.after);
	    }
    });
};

module.exports = SetupRoutesWithAuthorization;
