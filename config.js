'use strict'

exports.DB_URL = process.env.DB_URL || 'mongodb://admin:password1@ds133252.mlab.com:33252/challenges-photos';

exports.PORT = process.env.PORT || 8080;

exports.PHOTO_DB_URL = process.env.PHOTO_DB_URL || 'mongodb://admin:password1@ds151602.mlab.com:51602/photos-db';

exports.PHOTO_DB_PORT = process.env.PHOTO_DB_PORT || 5000;