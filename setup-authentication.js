var UserAuth = require('./user-auth');

var SetupAuthentication = function(app, userService, passport, config) {
    app.use(config.users_route, userService);
    app.service(config.users_route).before(UserAuth());
    //TODO: understand what 'local' means and then make it configurable
    app.post(config.login_route, passport.authenticate('local'), function(req, res) {
	    res.status(200).send(JSON.stringify(req.user));
    });
};

module.exports = SetupAuthentication;
