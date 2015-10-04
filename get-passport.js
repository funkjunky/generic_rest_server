var Passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

function GetPassport(userService) {
    Passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    Passport.deserializeUser(function(id, done) {
        userService.get(id, {}, done);
    });

    Passport.use(new LocalStrategy(function(username, password, done) {
        userService.authenticate(username, password, done);
    }));

    return Passport;
}

module.exports = GetPassport;
