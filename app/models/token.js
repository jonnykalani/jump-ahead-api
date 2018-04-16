'use strict'
const mongoose = require('mongoose')
// Creates schema for token
const tokenSchema = new mongoose.Schema({
  token_id: {
    type: String,
    required: true
  },
  total: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})
const Token = mongoose.model('Token', tokenSchema)
module.exports = Token
