var MongoDB = require('feathers-mongodb');

var ForEach = require('./foreach');
var GetBeforeHookSecurity = require('./get-before-hook-security');

var SetupRoutesWithAuthorization = function(app, collections, config) {
    ForEach(collections, function(authorization, collection) {
        //I'm lazy.. and I'm passing /api/ with my other server
        //TODO: figure out how to avoid needing api
        console.log('Collection registered: ', collection);
        app.use('/api/'+collection, MongoDB({
            connectionString: config.mongo_url,
            collection: collection,
        }));

        if(typeof authorization == 'object')
	        app.service('/api/'+collection).before(GetBeforeHookSecurity(authorization));
    });
};

module.exports = SetupRoutesWithAuthorization;
