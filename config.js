'use strict'

exports.USERS_DB_URL = process.env.USERS_DB_URL ||
'mongodb://localhost/challenge-photos/users';

exports.PORT = process.env.PORT || 8080