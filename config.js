'use strict'

const DB_URL = process.env.DB_URL || 'mongodb://localhost/challenge-photos';

const PORT = process.env.PORT || 8080;

module.exports = { DB_URL, PORT }