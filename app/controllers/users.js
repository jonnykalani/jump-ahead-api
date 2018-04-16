'use strict'

const debug = require('debug')('jump-ahead-api:users')

const controller = require('lib/wiring/controller')
const models = require('app/models')
const User = models.user

const crypto = require('crypto')

const authenticate = require('./concerns/authenticate')

const HttpError = require('lib/wiring/errors/http-error')

const MessageVerifier = require('lib/wiring/message-verifier')

const encodeToken = (token) => {
  const mv = new MessageVerifier('secure-token', process.env.SECRET_KEY)
  return mv.generate(token)
}

const getToken = () =>
  new Promise((resolve, reject) =>
    crypto.randomBytes(16, (err, data) => {
      console.log('data is', data)
      return err ? reject(err) : resolve(data.toString('base64'))
    })
  )

const index = (req, res, next) => {
  User.find({}).populate('_organization')
    .then(users => res.json({ users }))
    .catch(next)
}

const show = (req, res, next) => {
  User.findById(req.params.id)
    .then(user => user ? res.json({ user }) : next())
    .catch(next)
}

const makeErrorHandler = (res, next) =>
  error =>
    error && error.name && error.name === 'ValidationError'
      ? res.status(400).json({ error })
    : next(error)

const signup = (req, res, next) => {
  const credentials = req.body.credentials
  const user = {
    organization: credentials.organization,
    email: credentials.email,
    password: credentials.password,
    address: credentials.address,
    phone_number: credentials.phone_number,
    company_description: credentials.company_description
  }

  getToken()
    .then(token => {
      user.token = token
    })
    .then(() =>
      new User(user).save())
    .then(user =>
      res.status(201).json({ user }))
    .catch(makeErrorHandler(res, next))
}

const signin = (req, res, next) => {
  const credentials = req.body.credentials
  const search = { email: credentials.email }
  console.log('req.body is', req.body)
  User.findOne(search)
    .then(user =>
      user ? user.comparePassword(credentials.password)
            : Promise.reject(new HttpError(404)))
    .then(user =>
      getToken().then(token => {
        user.token = token
        console.log('token is now', token)
        return user.save()
      }))
    .then((user) => {
      console.log('req.body after getting token', req.body)
      return user
    })
    .then(user => {
      user = user.toObject()
      delete user.passwordDigest
      user.token = encodeToken(user.token)
      res.json({ user })
      console.log('user is', user)
    })
    .then(() => {
      console.log('req.body just before .catch is', req.body)
    })
    .catch(makeErrorHandler(res, next))
}

const signout = (req, res, next) => {
  getToken().then(token =>
    User.findOneAndUpdate({
      _id: req.params.id,
      token: req.user.token
    }, {
      token
    })
  ).then((user) =>
    user ? res.sendStatus(204) : next()
  ).catch(next)
}

const changepw = (req, res, next) => {
  debug('Changing password')
  User.findOne({
    _id: req.params.id,
    token: req.user.token
  }).then(user =>
    user ? user.comparePassword(req.body.passwords.old)
      : Promise.reject(new HttpError(404))
  ).then(user => {
    user.password = req.body.passwords.new
    return user.save()
  }).then((/* user */) =>
    res.sendStatus(204)
  ).catch(makeErrorHandler(res, next))
}

module.exports = controller({
  index,
  show,
  signup,
  signin,
  signout,
  changepw
}, { before: [
  { method: authenticate, except: ['signup', 'signin', 'index', 'show'] }
] })
