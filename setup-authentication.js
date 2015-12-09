var UserAuth = require('./user-auth');

var SetupAuthentication = function(app, userService, passport, config) {
    //show any user info
    app.use(config.route_prefix + config.users_route, userService);
    app.service(config.route_prefix + config.users_route).before(UserAuth());
    //Show current user
    app.use(config.route_prefix + '/user', function(req, res) {
        res.status(200).send(JSON.stringify(req.user));
    });
    //Login
    //TODO: understand what 'local' means and then make it configurable
    app.post(config.route_prefix + config.auth_prefix + config.login_route, passport.authenticate('local'), function(req, res) {
	    res.status(200).send(JSON.stringify(req.user));
    });
    //logout
    app.get(config.route_prefix + config.auth_prefix + '/logout', function(req, res) {
        req.logout();
        res.status(200).send('{"user": null}');
    });

    //TODO: config variables for all urls! Especially /auth/google
    //oauth google login
    app.get('/auth/google', passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login'],
    }));

    //oauth google login callback
    app.get(config.route_prefix + config.auth_prefix + config.google_callback_route, passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/auth/google',    //TODO: this should redirect to a login page... but this doesn't come with a login page... so i dunno...
    }));
};

module.exports = SetupAuthentication;
