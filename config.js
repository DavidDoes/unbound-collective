'use strict'

const TEST_DB_URL = 'mongodb://localhost/test-challenge-photos' || 1337

const DB_URL = process.env.DB_URL

// const DB_URL = 'mongodb://localhost/challenge-photos' || process.env.DB_URL
const PORT = process.env.PORT || 8080

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY

module.exports = { DB_URL, PORT, JWT_SECRET, JWT_EXPIRY, TEST_DB_URL }