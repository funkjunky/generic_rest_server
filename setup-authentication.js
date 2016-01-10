var UserAuth = require('./user-auth');

var consumeRedirect = function(req) {
    var redirect = req.session.redirect;
    req.session.redirect = null;
    return redirect;
};

var SetupAuthentication = function(app, userService, passport, config) {
    //show any user info
    app.use(config._routes.users(), userService);
    app.service(config._routes.users()).before(UserAuth());
    //Show current user
    app.use(config._routes.user(), function(req, res) {
        res.status(200).json(req.user);
    });
    //Login
    //TODO: understand what 'local' means and then make it configurable
    app.post(config._routes.login(), passport.authenticate('local'), function(req, res) {
	    res.status(200).json(req.user);
    });
    //logout
    app.get(config._routes.logout(), function(req, res) {
        req.logout();
        if(req.query.redirect)
            res.status(304).redirect(req.query.redirect);
        else if(req.headers['referer'])
            res.status(200).json(req.headers['referer']);
        else
            res.status(200).json(config._routes.user());
    });

    //TODO: config variables for all urls! Especially /auth/google, but also plus.login
    //oauth google login
    app.get(config._routes.oauth.google.auth(), function(req, res, next) {
        if(req.query.redirect)
            req.session.redirect = req.query.redirect;
        else if(req.headers['referer'])
            req.session.redirect = req.headers['referer'];

        passport.authenticate('google', { scope: config.google_scopes })(req, res, next);
    });

    //oauth google login callback
    app.get(config._routes.oauth.google.callback(), passport.authenticate('google', {
        successRedirect: config._routes.oauth.google.success(),
        failureRedirect: config._routes.oauth.google.failure(),
    }));

    app.get(config._routes.oauth.google.failure(), function(req, res, next) {
        var redirect_failure = config.google_failure_redirect();
        var redirect = consumeRedirect(req);
        if(redirect)
            redirect_failure += '?redirect=' + redirect;

        res.redirect(redirect_failure);
    });

    app.get(config._routes.oauth.google.success(), function(req, res, next) {
        if(req.session.redirect)
            res.redirect(consumeRedirect(req));
        else
            res.redirect(config._routes.user);
    });
};

module.exports = SetupAuthentication;
