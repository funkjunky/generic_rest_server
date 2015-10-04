var Multer = require('multer');
var Express = require('express');

var SetupUploadAndFileAccess = function(app, config) {
    var fileUpload = function(req, res) {
        res.set('Content-Type', 'application/json');
	    res.status(200).send(JSON.stringify({url: '/api' + config.file_route + '/' + req.file.filename, type: req.file.mimetype}));
    };

    var multer = Multer({dest: config.upload_dir});
    app.post(config.upload_route + '/:folder', multer.single('image'), fileUpload);
    app.post('/api' + config.upload_route + '/:folder', multer.single('image'), fileUpload);

    app.use(config.file_route, Express.static(__dirname + '/' + config.upload_dir));
};

module.exports = SetupUploadAndFileAccess;
