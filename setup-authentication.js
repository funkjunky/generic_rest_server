var UserAuth = require('./user-auth');

var consumeRedirect = function(req) {
    var redirect = req.session.redirect;
    req.session.redirect = null;
    return redirect;
};

var SetupAuthentication = function(app, userService, passport, config) {
    //show any user info
    app.use(config._usersRoute(), userService);
    app.service(config._usersRoute()).before(UserAuth());
    //Show current user
    app.use(config._userRoute(), function(req, res) {
        res.status(200).json(req.user);
    });
    //Login
    //TODO: understand what 'local' means and then make it configurable
    app.post(config._loginRoute(), passport.authenticate('local'), function(req, res) {
	    res.status(200).json(req.user);
    });
    //logout
    app.get(config._logoutRoute(), function(req, res) {
        req.logout();
        if(req.query.redirect)
            res.status(304).redirect(req.query.redirect);
        else if(req.headers['referer'])
            res.status(200).json(req.headers['referer']);
        else
            res.status(200).json(config._userRoute());
    });

    //TODO: config variables for all urls! Especially /auth/google, but also plus.login
    //oauth google login
    app.get(config._oauth.google.auth(), function(req, res, next) {
        if(req.query.redirect)
            req.session.redirect = req.query.redirect;
        else if(req.headers['referer'])
            req.session.redirect = req.headers['referer'];
        else
            req.session.redirect = config._userRoute();

        passport.authenticate('google', { scope: config.google_scopes })(req, res, next);
    });

    //oauth google login callback
    app.get(config._oauth.google.callback(), passport.authenticate('google', {
        successRedirect: config._oauth.google.success(),
        failureRedirect: config._oauth.google.failure(),
    }));

    app.get(config._oauth.google.failure(), function(req, res, next) {
        var redirect_failure = config.google_failure_redirect();
        var redirect = consumeRedirect(req);
        if(redirect)
            redirect_failure += '?redirect=' + redirect;

        res.redirect(redirect_failure);
    });

    app.get(config._oauth.google.success(), function(req, res, next) {
        if(req.session.redirect)
            res.redirect(consumeRedirect(req));
        else
            throw "We should have had a state with the oauth callback. Something went wrong.";
    });
};

module.exports = SetupAuthentication;
