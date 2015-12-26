var Passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;

function GetPassport(userService, config) {
    Passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    Passport.deserializeUser(function(id, done) {
        userService.get(id, {}, done);
    });

    Passport.use(new LocalStrategy(function(username, password, done) {
        userService.authenticate(username, password, done);
    }));

    //http://passportjs.org/docs/google
    Passport.use(new GoogleStrategy({
        clientID: config.google_id,
        clientSecret: config.google_secret,
        callbackURL: process.env.HOST + config.route_prefix + config.auth_prefix + config.google_callback_route,
        realm: process.env.HOST,
    }, function(token, tokenSecret, profile, done) {
        //TODO: what do i do with the token? I guess it's unnecessary as I only care about authentication and none of google's services.
        userService.findAndModify({
            query: { google_id: profile.id, },
            update: { google_id: profile.id, username: profile.displayName, groups: ['oauth']},
        }, function(err, user) {
            return done(err, user);
        });
    }));

    return Passport;
}

module.exports = GetPassport;
