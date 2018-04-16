'use strict'

const controller = require('lib/wiring/controller')
const models = require('app/models')
const Image = models.image
// const express = require('Express')

const authenticate = require('./concerns/authenticate')
const setUser = require('./concerns/set-current-user')
const setModel = require('./concerns/set-mongoose-model')
const mongoose = require('mongoose')
// const check = require('app/controllers/check-exports')

const s3Upload = require('lib/aws-s3-upload.js')
console.log('s3Upload is', s3Upload)
const multer = require('multer')
const multerUpload = multer({ dest: '/tmp/' })
const User = models.user

const index = (req, res, next) => {
  Image.find().populate('_owner')
    .then(images => res.json({
      images: images.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

const indexByUser = (req, res, next) => {
  Image.find({_owner: req.params.id}).populate('_owner')
    .then(webpages => res.json({
      webpages: webpages.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

const show = (req, res) => {
  res.json({
    image: req.image.toJSON({ virtuals: true, user: req.user })
  })
}

const create = (req, res, next) => {
  // setting 'file' to equate req object from multer
  // console.log('req is', req)
  console.log('req.file.path is', req.file.path)
  // console.log('req.body.image.description is', req.body.image.description)
  console.log('req.user._id is', req.user._id)
  console.log('req.body is', req.body)
  console.log('image is', req.body.image)
  const file = {
    path: req.file.path,
    // title: req.body.image.title,
    // description: req.body.image.description,
    url: '',
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    ownerId: req.user._id
  }
  console.log('file is', file)
// hopefully this will get passed on to the aws.js
// and successfully store an image in s3
  s3Upload(file)
    .then((s3Response) => {
      console.log('url is', s3Response.Location)
      console.log('_owner is', file.ownerId)
      return Image.create({
        // title: file.title,
        // description: file.description,
        url: s3Response.Location,
        _owner: file.ownerId
      })
    })
    .then((image) => {
      console.log('image object is', image)
      res.status(201)
        .json({ image: image.toJSON({ user: req.user }) })
      return image
    })
    .then(function (image) {
      User.findById(req.user._id)
        .then(function (user) {
          user.images.push(mongoose.Types.ObjectId(image._id))
        })
    })
    .catch(next)
}

const update = (req, res, next) => {
  delete req.body.image._owner  // disallow owner reassignment.

  req.image.update(req.body.image)
    .then(() => res.sendStatus(204))
    .catch(next)
}

const destroy = (req, res, next) => {
  req.image.remove()
    .then(() => res.sendStatus(204))
    .catch(next)
}

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy,
  indexByUser
}, { before: [
  { method: setUser, only: ['index', 'show', 'indexByUser'] },
  { method: authenticate, except: ['index', 'show', 'indexByUser'] },
  { method: multerUpload.single('image[file]'), only: ['create'] },
  { method: setModel(Image), only: ['show'] },
  { method: setModel(Image, { forUser: true }), only: ['update', 'destroy'] }
] })
