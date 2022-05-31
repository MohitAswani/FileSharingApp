const crypto = require('crypto');

const multer = require('multer');
const multerS3 = require('multer-s3');
const S3 = require('aws-sdk/clients/s3');

const region = process.env.AWS_BUCKET_REGION;

const bucketName = process.env.AWS_BUCKET_NAME;

const accessKey = process.env.AWS_ACCESS_KEY;

const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
    region,
    accessKey,
    secretAccessKey
});

// Upload a file using multer

exports.fileStorage = multerS3({
    s3: s3,
    bucket: bucketName,
    key: (req, file, cb) => {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                console.log(err);
            }
            else {
                cb(null, buf.toString('hex') + '-' + file.originalname);
            }
        });
    }
});

// Uploading a file normally

exports.uploadFile=(file,fileName)=>{
 
    const uploadParams={
        Bucket:bucketName,
        Body:file,
        Key:fileName
    };

    return s3.upload(uploadParams).promise();
}

// Download a file

exports.getFileStream = (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName
    }

    return s3.getObject(downloadParams).createReadStream();
}

// Delete the file

exports.deleteFile = (fileKey) => {

    const deleteParams = {
        Key:fileKey,
        Bucket: bucketName
    };

    return s3.deleteObject(deleteParams).promise();
}
