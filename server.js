const express = require('express')
const app = express()

app.use(express.static('public'))
app.use(express.static('css'))
app.listen(process.env.PORT || 8080)

module.exports = app