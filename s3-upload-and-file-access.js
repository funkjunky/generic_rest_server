var Express = require('express');
var Aws = require('aws-sdk');

var S3UploadAndFileAccess = function(app, config) {
    app.get('/api/sign_s3', function(req, res) {
        Aws.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY});
        var s3 = new Aws.S3();
        var s3_params = {
            Bucket: process.env.S3_BUCKET,
            Key: req.query.file_name,
            //Expires: 120,
            ContentType: "multipart/form-data",
            ACL: 'public-read',
        };
        s3.getSignedUrl('putObject', s3_params, function(err, data){
            if(err)
                res.status(500).json({error: err});
            else
                res.status(200).json({
                    signed_request: data,
                    url: 'https://'+process.env.S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
                });
        });
    });
};

module.exports = S3UploadAndFileAccess;
