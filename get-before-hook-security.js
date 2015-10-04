var ForEach = require('./foreach');

function getBeforeHook(security) {
	var hookObj = {};

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
	function getGroupSecurityHook(groups) {
	    return function(hook, next) {
	        if(groups === false                             //If groups is false, then the rest call is public (user isn't needed)
	            || groups === true && hook.params.user      //If groups is true, then we just need a logged in user
                || groups && hook.params.user && allowedGroup(hook.params.user.groups, groups)) //or if user is in an allowed group
	            next();
	        else
	            next(new Error('Insufficient access. You must be a member of one of the following groups: ', groups));
	    };
	}

    //TODO: use "map" for objects. Once I find one or make one.
	ForEach(security, function(groups, method) {
	    hookObj[method] = getGroupSecurityHook(groups);
	});

	return hookObj;
}

module.exports = getBeforeHook;
