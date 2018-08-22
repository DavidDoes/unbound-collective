'use strict'

exports.CHALLENGES_DB_URL = process.env.CHALLENGES_DB_URL ||
'mongodb://localhost/challenge-photos';

exports.PORT = process.env.PORT || 8080