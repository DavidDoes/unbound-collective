'use strict'

const TEST_DB_URL = 'mongodb://localhost/test-challenge-photos'
const TEST_PORT = 1337;

const DB_URL = process.env.DB_URL || 'mongodb://localhost/challenge-photos'

const PORT = process.env.PORT || 27017

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY

module.exports = { DB_URL, PORT, JWT_SECRET, JWT_EXPIRY, TEST_DB_URL, TEST_PORT }