var Multer = require('multer');
var Express = require('express');
var FileSystem = require('fs');

var LocalUploadAndFileAccess = function(app, config) {
    console.log('UPLOAD: LOCAL');
    var fileUpload = function(req, res, next) {
        var folder = req.params.folder || '';
        res.set('Content-Type', 'application/json');
	    res.status(200).send(JSON.stringify({url: config._routes.upload() + '/' + folder + '/' + req.file.originalname, type: req.file.mimetype}));
    };

    var uploadMulter = Multer({storage: Multer.diskStorage({
            destination: function(req, file, next) {
                var folder = req.params.folder || '';
                var makeFolderThenNext = function(err) {
                    FileSystem.mkdir(config.upload_path(folder), function(err) {
                        next(null, config.upload_path(folder));
                    });
                };
                FileSystem.access(config.upload_path(), FileSystem.F_OK, function(err) {
                    if(err)
                        FileSystem.mkdir(config.upload_path(), function(err) {
                            makeFolderThenNext();
                        });
                    else
                        makeFolderThenNext();
                });
            },
            filename: function(req, file, next) {
                next(null, file.originalname);
            }
        })
    });
    app.post('/api' + config.upload_route + '/:folder', uploadMulter.single('image'), fileUpload);

    app.use(config._routes.upload(), Express.static(__dirname + '/' + config.upload_dir));
};

module.exports = LocalUploadAndFileAccess;
