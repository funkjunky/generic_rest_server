var ForEach = require('./foreach');

var MongoDB = require('mongodb').MongoClient;

function GetHooks(collectionConfig, mongo_url) {
	var hookObj = {before: {}, after: {}};

    //TODO: race condition
	var dbhObj = {};
    console.log('the mongourl: ', mongo_url);
	MongoDB.connect(mongo_url, function(err, db) {
	    if(err) {
	        console.log('err...');
	        throw err;
	    }

	    console.log('connected to mongo... for hooks');
	    dbhObj.dbh = db;
	});

    //TODO: use "map" for objects. Once I find one or make one.
	ForEach(collectionConfig, function(methodConfig, method) {
	    if(methodConfig.auth || methodConfig.before)
	        hookObj.before[method] = getGroupBeforeHook(methodConfig.auth, methodConfig.before, dbhObj);
	    if(methodConfig.after)
	        hookObj.after[method] = getGroupAfterHook(methodConfig.after, dbhObj);
	});

	return hookObj;
}

function getGroupAfterHook(afterHook, dbhObj) {
	return function(hook, next) {
	    return afterHook(dbhObj.dbh, hook, next);
	};
}

function getGroupBeforeHook(auth, beforeHook, dbhObj) {
	return function(hook, next) {
        var securityResponse;
	    if(auth)
	        securityResponse = groupSecurityHook(hook, auth);

	    if(securityResponse)
	        next(new Error('Insufficient privilages', securityResponse));
        else if(beforeHook)
	        beforeHook(dbhObj.dbh, hook, next, securityResponse);
	    else
	        next();
	};
}

//returns whether the usergroups have access to the routegroups
function allowedGroup(user, routeGroups) {
    if(user.super)
        return true;
    else if(!user.groups)
        return false;

    return user.groups.some(function(group) {
        return routeGroups.indexOf(group) != -1;
    });
}

//returns an object of all the before hooks that ensure security for the route
function groupSecurityHook(hook, groups) {
	if((groups === true && hook.params.user)      //If groups is true, then we just need a logged in user
            || (groups && hook.params.user && allowedGroup(hook.params.user, groups))) //or if user is in an allowed group
	    return;
	else
	    return {error: 'Insufficient access.'};
}

module.exports = GetHooks;
