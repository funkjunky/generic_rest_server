var ConnectMongo = require('connect-mongo');

function PassportConfigs(passport, userService, globalConfig) {
    return function(config) {
	    // MongoStore needs the session function
	    var MongoStore = ConnectMongo(config.createSession);

        //TODO: get secret from environment variable
	    config.secret = globalConfig.store_secret;
	    config.store = new MongoStore({
	        db: globalConfig.db,
	    });
	    config.resave = false;
	    config.saveUninitialized = false;
	    config.passport = passport;

	    return config;
	};
}

module.exports = PassportConfigs;
