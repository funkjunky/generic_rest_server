var MongoDB = require('feathers-mongodb');
var Crypto = require('crypto');

var UserService = function(mongo_url, adminUser, adminPass) {
    console.log('the mongourl: ', mongo_url);
    return MongoDB({
        connectionString: mongo_url,
        collection: 'users',
    }).extend({
        authenticate: function(username, password, callback) {
            console.log('username: ', username);
            if(username == adminUser && password == adminPass) {
                return this.find({query: {_id: -1337}}, function(error, users) {
                    //TODO: centralize the error handling somehow... I don't like all this repeating.
                    if(error)
                        callback(error);

                    var user = users[0];
                    if(!user)
                        return this.create({_id: -1337, username: adminUser}, {}, function(err, response) {
                            //TODO: return the user info returned by the response
                            return callback(null, {_id: -1337, username: username, super: true});
                        });
                    else
                        return callback(null, {_id: -1337, username: username, super: true});
                }.bind(this)); //TODO: is this bind necessary?
            }
            this.find({query: {username: username}}, function(error, users) {
                if(error)
                    callback(error);

                var user = users[0];
                if(!user)
                    return callback(new Error('No User Found'));

                if(user.password !== hash(password, user.salt))
                    return callback(new Error('Password Is Incorrect'));

                //success, return the authenticated user
                return callback(null, user);
            });
        },
        setup: function() {
            this.before({
                create: function(hook, next) {
                    if(!hook.data.salt)
                        next();     //this well be the case with oauth
                    //Create the salt
                    var salt = Crypto.randomBytes(128).toString('base64');
                    hook.data.salt = salt;
                    hook.data.password = hash(hook.data.password, hook.data.salt);

                    next();
                },
            });
        },

        //NOTE: This is because feathers mongoDB extension doesn't include many useful functions
        findAndModify: function(options, fnc) {
            this.find({query: options.query}, function(err, docs) {
                if(docs.length > 0)
                    fnc(err, docs[0]);
                else
                    this.create(options.update, null, fnc);
            }.bind(this));
        },
    });
};

module.exports = UserService;

function hash(string, salt) {
    var shasum = Crypto.createHash('sha256');
    shasum.update(string + salt);
    return shasum.digest('hex');
}
