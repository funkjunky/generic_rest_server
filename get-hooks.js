var ForEach = require('./foreach');

var MongoDB = require('mongodb').MongoClient;

function GetHooks(collectionConfig, mongo_url) {
	var hookObj = {before: {}, after: {}};

    //TODO: race condition
	var dbhObj = {};
	MongoDB.connect(mongo_url, function(err, db) {
	    if(err)
	        throw err;

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

	    if(securityResponse == Error)
	        next(securityResponse);
        else if(beforeHook)
	        beforeHook(dbhObj.dbh, hook, next, securityResponse);
	    else
	        next();
	};
}

//returns whether the usergroups have access to the routegroups
function allowedGroup(userGroups, routeGroups) {
    if(!userGroups)
        return false;

    if(routeGroups.some(userGroups))
        return true;
    else
        return userGroups.some(function(group) {
            if(config.groups[group])
                return allowedGroup(config.groups[group], routeGroups);
            else
                return false;
        });
}

//returns an object of all the before hooks that ensure security for the route
function groupSecurityHook(hook, groups) {
	if(groups === true && hook.params.user      //If groups is true, then we just need a logged in user
            || groups && hook.params.user && allowedGroup(hook.params.user.groups, groups)) //or if user is in an allowed group
	    return;
	else
	    return new Error('Insufficient access. You must be a member of one of the following groups: ', groups);
}

module.exports = GetHooks;
