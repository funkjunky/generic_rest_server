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
	finalConfig.db = finalConfig.mongo_url.split('/').slice(-1)[0]; //TODO: anything more effecient than this, lol (but obvs i want it simple, so make an end fnc)

    //user configs
	finalConfig.admin_user = process.env.ADMINUSER || config.admin_user;
	finalConfig.admin_pass = process.env.ADMINPASS || config.admin_pass;

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
