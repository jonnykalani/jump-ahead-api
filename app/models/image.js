'use strict'

const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
  path: String,
  title: {
    type: String
  },
  description: String,
  url: {
    type: String
  },
  _owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret, options) {
      const userId = (options.user && options.user._id) || false
      ret.editable = userId && userId.equals(doc._owner)
      return ret
    }
  }
})

const Image = mongoose.model('Image', imageSchema)

module.exports = Image
