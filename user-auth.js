function UserAuth() {
    return {
	    updated: function(hook, next) {
	        //TODO: im not sure if hook.params.username well be what i want
	        if(hook.params.user && (hook.params.user.username == hook.params.username || hook.params.user.super))
	            return next();
	        else
	            return next(new Error('Only root and owner can edit users'));
	    },
	    deleted: function(hook, next) {
	        //TODO: im not sure if hook.params.username well be what i want
	        if(hook.params.user && (hook.params.user.username == hook.params.username || hook.params.user.super))
	            return next();
	        else
	            return next(new Error('Only root and owner can delete users'));
	    },
    };
}

module.exports = UserAuth;
