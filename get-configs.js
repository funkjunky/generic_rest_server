var FileSystem = require('fs')
function GetConfigs(configPath, defaultConfigPath, process) {
	if(FileSystem.existsSync(defaultConfigPath))
	    config = require(defaultConfigPath);
	else
	    console.error('Base Config File doesnt exist!! Where did config.js go??');

    var finalConfig = extendObj({}, config);
	if(configPath) {
	    if(FileSystem.existsSync(configPath))
		    finalConfig = extendObj(config, require(process.cwd() + '/' + configPath));
	    else
	        console.error('Config file specified doesnt exist: ', configPath);
	}

	//command line and environment variables
	if(process.env[config.mongo_url_env]) finalConfig.mongo_url = process.env[config.mongo_url_env];
	if(process.env.PORT) finalConfig.port = process.env.PORT;

	//defaults
	//TODO: Might not need db anymore. I think i just use mongo_url
	finalConfig.db = finalConfig.mongo_url.split('/').slice(-1)[0]; //TODO: anything more effecient than this, lol (but obvs i want it simple, so make an end fnc)

    //user configs
    console.log('admin user (env config): ', process.env.ADMIN_USER);
	finalConfig.admin_user = process.env.ADMIN_USER || config.admin_user;
	finalConfig.admin_pass = process.env.ADMIN_PASS || config.admin_pass;

	//passport configs
	finalConfig.google_id = process.env.GOOGLE_ID || config.google_id;
	finalConfig.google_secret = process.env.GOOGLE_SECRET || config.google_secret;

	return finalConfig;
}

//does in in-place extension of an object. Hacky, but whatevs
function extendObj(defaultObj, newObj) {
    var retObj = {};
    for(var key in defaultObj)
        retObj[key] = defaultObj[key];
    for(var key in newObj)
        retObj[key] = newObj[key];

    return retObj;
}

module.exports = GetConfigs;
