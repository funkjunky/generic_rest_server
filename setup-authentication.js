var UserAuth = require('./user-auth');

var SetupAuthentication = function(app, userService, passport, config) {
    //show any user info
    app.use(config.route_prefix + config.users_route, userService);
    app.service(config.route_prefix + config.users_route).before(UserAuth());
    //Show current user
    app.use(config.route_prefix + config.user_route, function(req, res) {
        res.status(200).json(req.user);
    });
    //Login
    //TODO: understand what 'local' means and then make it configurable
    app.post(config.route_prefix + config.auth_prefix + config.login_route, passport.authenticate('local'), function(req, res) {
	    res.status(200).json(req.user);
    });
    //logout
    app.get(config.route_prefix + config.auth_prefix + '/logout', function(req, res) {
        req.logout();
        if(req.query.redirect)
            res.status(304).redirect(req.query.redirect);
        else if(req.headers['referer'])
            res.status(200).json(req.headers['referer']);
        else
            res.status(200).json(config.route_prefix + config.user_route);
    });

    //TODO: config variables for all urls! Especially /auth/google, but also plus.login
    //oauth google login
    app.get(config.route_prefix + config.auth_prefix + config.google_route, function(req, res, next) {
        var options = { scope: config.google_scopes };
        if(req.query.redirect)
            options.state = encodeURIComponent(req.query.redirect);
        else if(req.headers['referer'])
            options.state = encodeURIComponent(req.headers['referer']);
        else
            options.state = encodeURIComponent('/api/user');

        passport.authenticate('google', options)(req, res, next);
    });

    //oauth google login callback
    app.get(config.route_prefix + config.auth_prefix + config.google_callback_route, function(req, res, next) {
        console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
        //Note: I'm passing a no-op to authenticate, because I feel like passport needs to do something, but I don't want it to "next"
        var passportNext = function (){};
        if(req.query.error)
            passportNext = next;

        var redirect_failure = config.google_redirect_failure;
        if(req.query.state)
            redirect_failure += '?redirect=' + req.query.state;
        passport.authenticate('google', {
            failureRedirect: redirect_failure,
        })(req, res, next);

        if(req.query.error) return;

        if(req.query.state)
            res.redirect(decodeURIComponent(req.query.state));
        else
            res.redirect('/api/user/root');
    });
};

module.exports = SetupAuthentication;
