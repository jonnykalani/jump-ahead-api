'use strict'
const controller = require('lib/wiring/controller')
const models = require('app/models')
const Token = models.token
const stripe = require('stripe')(process.env.STRIPE_SECRET)

const create = (req, res, next) => {
  const token = Object.assign(req.body.token)
  Token.create(token)
    .then(token =>
      res.status(201)
        .json({
          token: token.toJSON({ virtuals: true, user: req.user })
        })).then(() => {
          const token = req.body.token.token_id
          stripe.charges.create({
            amount: 1999,
            currency: 'usd',
            description: 'Website Payment',
            source: token
          })
          .then((something) => {
            return something
          })
        })
    .catch(next)
}
module.exports = controller({
  create
})
