'use strict'

exports.SUBMISSIONS_DB_URL = process.env.SUBMISSIONS_DB_URL || 8080 || 'mongodb://localhost/challenge-photos';

exports.CHALLENGES_DB_URL = process.env.CHALLENGES_DB_URL ||
'mongodb://localhost/challenge-photos';

exports.USERS_DB_URL = process.env.USERS_DB_URL ||
'mongodb://localhost/challenge-photos';

exports.PORT = process.env.PORT || 8080