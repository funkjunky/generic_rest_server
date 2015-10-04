var MongoDB = require('feathers-mongodb');
var Crypto = require('crypto');

var UserService = function(database, adminUser, adminPass) {
    return MongoDB({
        db: database,
        collection: '_users',
    }).extend({
        authenticate: function(username, password, callback) {
            console.log('username: ', username);
            if(username == adminUser && password == adminPass)
                return callback(null, {_id: -1337, username: username, super: true});
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
                    //Create the salt
                    var salt = Crypto.randomBytes(128).toString('base64');
                    hook.data.salt = salt;
                    hook.data.password = hash(hook.data.password, hook.data.salt);

                    next();
                },
            });
        },
    });
};

module.exports = UserService;

function hash(string, salt) {
    var shasum = Crypto.createHash('sha256');
    shasum.update(string + salt);
    return shasum.digest('hex');
}
