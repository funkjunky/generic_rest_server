var UserAuth = require('./user-auth');

var SetupAuthentication = function(app, userService, passport, config) {
    app.use(config.route_prefix + config.users_route, userService);
    app.service(config.route_prefix + config.users_route).before(UserAuth());
    //TODO: understand what 'local' means and then make it configurable
    app.post(config.route_prefix + config.login_route, passport.authenticate('local'), function(req, res) {
	    res.status(200).send(JSON.stringify(req.user));
    });
    app.get(config.route_prefix + config.login_route, function(req, res) {
        req.logout();
        res.status(200).send('{"user": null}');
    });
};

module.exports = SetupAuthentication;
